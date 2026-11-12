import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { NutriColors } from '@/constants/nutri';
import { DEFAULT_DATE } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

import { CalendarIcon, ChevronRightIcon } from './icons';

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLabel(date: Date) {
  if (isSameDay(date, DEFAULT_DATE)) {
    return 'Today, Apr 26';
  }
  return `${WEEKDAY_SHORT[date.getDay()]}, ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

type DateSelectorProps = {
  date: Date;
  onChange: (date: Date) => void;
};

export function DateSelector({ date, onChange }: DateSelectorProps) {
  const { scale } = useAppFrame();
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setPickerVisible(true)}
        style={({ pressed }) => [selector(scale), pressed && styles.pressed]}>
        <CalendarIcon size={22 * scale} />
        <Text style={label(scale)}>{formatLabel(date)}</Text>
        <ChevronRightIcon size={18 * scale} color="#C9D2E4" />
      </Pressable>
      <DatePickerModal
        visible={pickerVisible}
        selected={date}
        onSelect={(next) => {
          setPickerVisible(false);
          onChange(next);
        }}
        onDismiss={() => setPickerVisible(false)}
      />
    </>
  );
}

type DatePickerModalProps = {
  visible: boolean;
  selected: Date;
  onSelect: (date: Date) => void;
  onDismiss: () => void;
};

function DatePickerModal({ visible, selected, onSelect, onDismiss }: DatePickerModalProps) {
  const { scale } = useAppFrame();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const cells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leading = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...leading, ...days];
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onDismiss} />
        <View style={sheet(scale)}>
          <View style={sheetHeader(scale)}>
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={12}>
              <Text style={monthArrow(scale)}>{'‹'}</Text>
            </Pressable>
            <Text style={monthTitle(scale)}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={12}>
              <Text style={monthArrow(scale)}>{'›'}</Text>
            </Pressable>
          </View>
          <View style={weekRow(scale)}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={`wd-${index}`} style={weekDay(scale)}>
                {day}
              </Text>
            ))}
          </View>
          <View style={grid(scale)}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={dayCell(scale)} />;
              }
              const cellDate = new Date(viewYear, viewMonth, day);
              const isSelected = isSameDay(cellDate, selected);
              const isDefault = isSameDay(cellDate, DEFAULT_DATE);
              return (
                <Pressable
                  key={`day-${day}`}
                  onPress={() => onSelect(cellDate)}
                  style={[dayCell(scale), isSelected && daySelected(scale)]}>
                  <Text
                    style={[
                      dayText(scale),
                      isSelected && styles.dayTextSelected,
                      !isSelected && isDefault && styles.dayTextDefault,
                    ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={doneButton(scale)} onPress={onDismiss}>
            <Text style={doneText(scale)}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function selector(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62 * scale,
    borderRadius: 17 * scale,
    backgroundColor: NutriColors.card,
    borderWidth: 1.3,
    borderColor: 'rgba(22, 139, 255, 0.55)',
    paddingHorizontal: 18 * scale,
    marginTop: 18 * scale,
    marginHorizontal: 26 * scale,
  };
}

function label(scale: number): TextStyle {
  return {
    flex: 1,
    color: '#F2F5FC',
    fontSize: 17 * scale,
    fontWeight: '600',
    marginLeft: 13 * scale,
  };
}

function sheet(scale: number): ViewStyle {
  return {
    backgroundColor: NutriColors.card,
    borderTopWidth: 1.3,
    borderLeftWidth: 1.3,
    borderRightWidth: 1.3,
    borderColor: 'rgba(22, 139, 255, 0.55)',
    borderTopLeftRadius: 26 * scale,
    borderTopRightRadius: 26 * scale,
    paddingHorizontal: 18 * scale,
    paddingTop: 18 * scale,
    paddingBottom: 26 * scale,
  };
}

function sheetHeader(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10 * scale,
  };
}

function monthArrow(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 26 * scale,
    fontWeight: '600',
    paddingHorizontal: 10 * scale,
  };
}

function monthTitle(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 16.5 * scale,
    fontWeight: '700',
  };
}

function weekRow(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    marginBottom: 4 * scale,
  };
}

function weekDay(scale: number): TextStyle {
  return {
    flex: 1,
    textAlign: 'center',
    color: NutriColors.textFaint,
    fontSize: 12.5 * scale,
    fontWeight: '600',
  };
}

function grid(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6 * scale,
  };
}

function dayCell(scale: number): ViewStyle {
  return {
    width: `${100 / 7}%` as `${number}%`,
    height: 38 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19 * scale,
  };
}

function daySelected(scale: number): ViewStyle {
  return {
    backgroundColor: NutriColors.purple,
  };
}

function dayText(scale: number): TextStyle {
  return {
    color: '#DDE4F2',
    fontSize: 14 * scale,
    fontWeight: '500',
  };
}

function doneButton(scale: number): ViewStyle {
  return {
    marginTop: 14 * scale,
    height: 46 * scale,
    borderRadius: 14 * scale,
    backgroundColor: NutriColors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function doneText(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 15.5 * scale,
    fontWeight: '700',
  };
}

const styles = {
  pressed: { opacity: 0.85 } as ViewStyle,
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 5, 15, 0.72)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  dismissArea: {
    flex: 1,
  } as ViewStyle,
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  } as TextStyle,
  dayTextDefault: {
    color: NutriColors.purple,
    fontWeight: '700',
  } as TextStyle,
};
