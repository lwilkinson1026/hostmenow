import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

export default function TabsLayout() {
  const isMember = useApp((s) => s.isMember);
  if (!isMember) return <Redirect href="/" />;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.light.bg } }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
