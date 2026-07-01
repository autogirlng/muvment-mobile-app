import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView,
} from 'react-native';

import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { NotificationCard } from '../src/components/common/NotificationCard';
import { EmptyState } from '../src/components/common/EmptyState'; // Imported the reusable component
import { DashboardHeader } from '../src/components/layout/DashboardHeader';
import { GROUPED_NOTIFICATIONS_DATA } from '../src/data/mockData';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(GROUPED_NOTIFICATIONS_DATA);

  // Dynamically calculate total remaining notifications across all sections
  const totalNotifications = notifications.reduce((acc, section) => acc + section.data.length, 0);

  const handleDismiss = (sectionIndex: number, notifId: string) => {
    const updated = [...notifications];
    updated[sectionIndex].data = updated[sectionIndex].data.filter(n => n.id !== notifId);
    setNotifications(updated);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <DashboardHeader title="Notifications" />

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24, paddingHorizontal: 16 }} bounces={true}>
        {totalNotifications > 0 ? (
          notifications.map((section, sectionIndex) => {
            if (section.data.length === 0) return null;

            return (
              <View key={section.section} className="mb-4">
                <Text className="font-inter font-medium text-[13px] text-[#475367] tracking-wider mb-3 ml-1 uppercase">
                  {section.section}
                </Text>
                
                {section.data.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    iconName={notif.iconName}
                    title={notif.title}
                    description={notif.description}
                    timestamp={notif.timestamp}
                    isDismissible={notif.isDismissible}
                    onDismiss={() => handleDismiss(sectionIndex, notif.id)}
                  />
                ))}
              </View>
            );
          })
        ) : (
          // Displays when all notifications are cleared or none are returned by an API
          <View className="flex-1 justify-center pb-20">
            <EmptyState 
              title="No notifications yet"
              description="When you receive trip updates, reminders, or payment alerts, they'll appear here."
            />
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}
