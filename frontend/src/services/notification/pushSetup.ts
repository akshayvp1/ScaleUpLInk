// services/notification/pushSetup.ts
import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notificationService from './notificationService';

export async function setupPushNotifications() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (!enabled) return;

  const token = await messaging().getToken();
  await notificationService.registerDevice(token, Platform.OS === 'ios' ? 'ios' : 'android');

  messaging().onTokenRefresh((newToken: string) => {
    notificationService.registerDevice(newToken, Platform.OS === 'ios' ? 'ios' : 'android');
  });

  messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    // foreground — show your own in-app toast/banner here, e.g.:
    // Toast.show({ text1: remoteMessage.notification?.title, text2: remoteMessage.notification?.body });
    console.log('Foreground push received:', remoteMessage);
  });
}