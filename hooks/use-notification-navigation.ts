import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
export function useNotificationNavigation() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    let cleanup: (() => void) | undefined;
    void import('expo-notifications').then(async notifications => {
      if (!active) return;
      notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner:true, shouldShowList:true, shouldPlaySound:false, shouldSetBadge:false }) });
      const open = (response: import('expo-notifications').NotificationResponse) => {
        if (active && response.notification.request.content.data.screen === 'chores') {
          router.push('/explore');
          void notifications.clearLastNotificationResponseAsync();
        }
      };
      const subscription = notifications.addNotificationResponseReceivedListener(open);
      cleanup = () => subscription.remove();
      const response = await notifications.getLastNotificationResponseAsync();
      if (response) open(response);
    }).catch(() => { /* Registration remains available if notification support is unavailable. */ });
    return () => { active = false; cleanup?.(); };
  }, []);
}
