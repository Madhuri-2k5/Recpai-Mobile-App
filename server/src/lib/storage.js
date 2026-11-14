import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

let store = {
  users: [],
  recipes: [],
  dailyLogs: [],
  posts: [],
  groups: [],
  challenges: [],
};

let loaded = false;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadStore() {
  if (loaded) return store;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      store = { ...store, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
  }
  loaded = true;
  return store;
}

export function saveStore() {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function generateId() {
  return (
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10)
  ).substring(0, 24);
}

function matchesFilter(item, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      if (!value.some((sub) => matchesFilter(item, sub))) return false;
      continue;
    }
    if (key === '_id' || key === 'id') {
      const itemId = String(item._id || item.id);
      if (typeof value === 'object' && value && '$in' in value) {
        const set = new Set(value.$in.map(String));
        if (!set.has(itemId)) return false;
      } else if (itemId !== String(value)) {
        return false;
      }
      continue;
    }

    if (key === 'members') {
      const members = (item.members || []).map(String);
      if (typeof value === 'object' && value && '$in' in value) {
        if (!value.$in.some((v) => members.includes(String(v)))) return false;
      } else if (!members.includes(String(value))) {
        return false;
      }
      continue;
    }

    if (key === 'meals.0') {
      if (value && typeof value === 'object' && value.$exists) {
        if (!Array.isArray(item.meals) || item.meals.length === 0) return false;
      }
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      if ('$in' in value && Array.isArray(value.$in)) {
        const itemVal = item[key];
        const inSet = new Set(value.$in.map(String));
        if (!inSet.has(String(itemVal))) return false;
      } else if ('$exists' in value) {
        const exists = item[key] !== undefined && item[key] !== null;
        if (Boolean(value.$exists) !== exists) return false;
      }
      continue;
    }

    if (String(item[key] ?? '') !== String(value ?? '')) {
      return false;
    }
  }

  return true;
}

class QueryWrapper {
  constructor(collectionName, filter = {}) {
    this.collectionName = collectionName;
    this.filter = filter;
    this._sort = null;
    this._limit = null;
    this._populates = [];
    this._select = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  populate(field, select) {
    this._populates.push({ field, select });
    return this;
  }

  async then(resolve, reject) {
    try {
      const items = await this.exec();
      resolve(items);
    } catch (err) {
      if (reject) reject(err);
      else throw err;
    }
  }

  async exec() {
    loadStore();
    const list = store[this.collectionName] || [];
    let results = list.filter((item) => matchesFilter(item, this.filter));

    if (this._sort) {
      for (const [key, dir] of Object.entries(this._sort)) {
        results.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === -1 ? 1 : -1;
          if (valA > valB) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
    }

    if (this._limit !== null && this._limit >= 0) {
      results = results.slice(0, this._limit);
    }

    results = results.map((item) => attachHelpers(this.collectionName, { ...item }));

    for (const pop of this._populates) {
      for (const item of results) {
        populateField(item, pop.field, pop.select);
      }
    }

    return results;
  }
}

function populateField(item, field, select) {
  const refId = item[field];
  if (!refId) return;

  loadStore();
  let target = null;
  if (field === 'user' || field === 'owner') {
    target = store.users.find((u) => String(u._id) === String(refId) || String(u.id) === String(refId));
  } else if (field === 'group') {
    target = store.groups.find((g) => String(g._id) === String(refId) || String(g.id) === String(refId));
  } else if (field === 'recipe') {
    target = store.recipes.find((r) => String(r._id) === String(refId) || String(r.id) === String(refId));
  } else if (field === 'members') {
    if (Array.isArray(item.members)) {
      item.members = item.members
        .map((mId) => store.users.find((u) => String(u._id) === String(mId) || String(u.id) === String(mId)))
        .filter(Boolean)
        .map((u) => ({ id: u.id, _id: u._id, name: u.name }));
    }
    return;
  }

  if (target) {
    if (select) {
      const keys = select.split(/\s+/).filter(Boolean);
      const sub = { id: target.id, _id: target._id };
      for (const k of keys) {
        sub[k] = target[k];
      }
      item[field] = sub;
    } else {
      item[field] = { ...target };
    }
  }
}

function attachHelpers(collectionName, item) {
  if (!item) return null;
  item.id = item._id ? String(item._id) : generateId();
  item._id = item.id;

  if (collectionName === 'dailyLogs') {
    Object.defineProperty(item, 'totals', {
      get() {
        const meals = this.meals || [];
        return meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
      },
      enumerable: true,
      configurable: true,
    });
  }

  item.save = async function () {
    loadStore();
    const list = store[collectionName] || [];
    const index = list.findIndex((x) => String(x._id) === String(this._id) || String(x.id) === String(this.id));
    this.updatedAt = new Date();
    if (index >= 0) {
      list[index] = { ...this };
    } else {
      list.push({ ...this });
    }
    saveStore();
    return this;
  };

  return item;
}

export function createModelProxy(mongooseModel, storeModel, isMongoActive) {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (typeof isMongoActive === 'function' && !isMongoActive()) {
        const storeVal = Reflect.get(storeModel, prop, receiver);
        if (storeVal !== undefined) return storeVal;
      }
      return Reflect.get(target, prop, receiver);
    },
    construct(target, args) {
      if (typeof isMongoActive === 'function' && !isMongoActive()) {
        return storeModel.create(args[0]);
      }
      return Reflect.construct(target, args);
    },
  });
}

export function createStoreModel(collectionName, defaults = {}) {

  return {
    find(filter = {}) {
      return new QueryWrapper(collectionName, filter);
    },

    async findOne(filter = {}) {
      loadStore();
      const list = store[collectionName] || [];
      const found = list.find((item) => matchesFilter(item, filter));
      return found ? attachHelpers(collectionName, { ...found }) : null;
    },

    findById(id) {
      return {
        _id: id,
        _populates: [],
        populate(field, select) {
          this._populates.push({ field, select });
          return this;
        },
        async then(resolve, reject) {
          try {
            if (!this._id) return resolve(null);
            loadStore();
            const list = store[collectionName] || [];
            const found = list.find((item) => String(item._id) === String(this._id) || String(item.id) === String(this._id));
            if (!found) return resolve(null);
            const wrapped = attachHelpers(collectionName, { ...found });
            for (const pop of this._populates) {
              populateField(wrapped, pop.field, pop.select);
            }
            resolve(wrapped);
          } catch (err) {
            if (reject) reject(err);
            else throw err;
          }
        },
        catch(reject) {
          return this.then(null, reject);
        },
      };
    },

    async create(data) {
      loadStore();
      const id = generateId();
      const now = new Date();
      const record = {
        ...defaults,
        ...data,
        _id: id,
        id,
        createdAt: now,
        updatedAt: now,
      };
      store[collectionName] = store[collectionName] || [];
      store[collectionName].push(record);
      saveStore();
      return attachHelpers(collectionName, { ...record });
    },

    async findByIdAndUpdate(id, update, options = {}) {
      loadStore();
      const list = store[collectionName] || [];
      const index = list.findIndex((item) => String(item._id) === String(id) || String(item.id) === String(id));
      if (index === -1) return null;

      let target = list[index];
      if (update.$push) {
        for (const [key, val] of Object.entries(update.$push)) {
          target[key] = Array.isArray(target[key]) ? target[key] : [];
          target[key].push(val);
        }
      }
      for (const [key, val] of Object.entries(update)) {
        if (!key.startsWith('$')) {
          target[key] = val;
        }
      }
      target.updatedAt = new Date();
      list[index] = target;
      saveStore();
      const wrapped = attachHelpers(collectionName, { ...target });
      return wrapped;
    },

    async findOneAndUpdate(filter, update, options = {}) {
      loadStore();
      const list = store[collectionName] || [];
      let index = list.findIndex((item) => matchesFilter(item, filter));

      if (index === -1) {
        if (options.upsert) {
          const id = generateId();
          const record = {
            ...defaults,
            ...filter,
            _id: id,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (update.$push) {
            for (const [key, val] of Object.entries(update.$push)) {
              record[key] = [val];
            }
          }
          list.push(record);
          saveStore();
          return attachHelpers(collectionName, { ...record });
        }
        return null;
      }

      let target = list[index];
      if (update.$push) {
        for (const [key, val] of Object.entries(update.$push)) {
          target[key] = Array.isArray(target[key]) ? target[key] : [];
          target[key].push(val);
        }
      }
      for (const [key, val] of Object.entries(update)) {
        if (!key.startsWith('$')) {
          target[key] = val;
        }
      }
      target.updatedAt = new Date();
      list[index] = target;
      saveStore();
      return attachHelpers(collectionName, { ...target });
    },

    async findOneAndDelete(filter) {
      loadStore();
      const list = store[collectionName] || [];
      const index = list.findIndex((item) => matchesFilter(item, filter));
      if (index === -1) return null;
      const [removed] = list.splice(index, 1);
      saveStore();
      return attachHelpers(collectionName, removed);
    },

    async updateOne(filter, update, options = {}) {
      return this.findOneAndUpdate(filter, update, options);
    },

    async countDocuments(filter = {}) {
      loadStore();
      const list = store[collectionName] || [];
      return list.filter((item) => matchesFilter(item, filter)).length;
    },

    async aggregate(pipeline = []) {
      loadStore();
      let results = [...(store[collectionName] || [])];

      for (const stage of pipeline) {
        if (stage.$match) {
          results = results.filter((item) => matchesFilter(item, stage.$match));
        } else if (stage.$unwind) {
          const field = stage.$unwind.replace(/^\$/, '');
          const unrolled = [];
          for (const item of results) {
            const arr = item[field];
            if (Array.isArray(arr)) {
              for (const elem of arr) {
                unrolled.push({ ...item, [field]: elem });
              }
            }
          }
          results = unrolled;
        } else if (stage.$group) {
          const idField = String(stage.$group._id).replace(/^\$/, '');
          const map = new Map();
          for (const item of results) {
            const key = item[idField] !== undefined ? String(item[idField]) : null;
            if (!map.has(key)) {
              map.set(key, { _id: key, count: 0 });
            }
            const grp = map.get(key);
            for (const [aggKey, aggDef] of Object.entries(stage.$group)) {
              if (aggKey === '_id') continue;
              if (aggDef.$sum) {
                grp[aggKey] = (grp[aggKey] || 0) + (aggDef.$sum === 1 ? 1 : Number(item[String(aggDef.$sum).replace(/^\$/, '')]) || 0);
              }
            }
          }
          results = Array.from(map.values());
        }
      }

      return results;
    },
  };
}
