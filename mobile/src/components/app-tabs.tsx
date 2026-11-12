import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { BottomNav, NavItem } from '@/components/dashboard/BottomNavigation';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomNav>
          <TabTrigger name="home" href="/" asChild>
            <NavItem icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="scan" href="/scan" asChild>
            <NavItem icon="scan" label="Scan" />
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <NavItem icon="community" label="Community" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <NavItem icon="profile" label="Profile" />
          </TabTrigger>
        </BottomNav>
      </TabList>
    </Tabs>
  );
}
