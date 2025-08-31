import { useAuth } from '@/services/providers/AuthProvider';
import { updateProfileExpoPushToken } from '@/utils/supabase/crudProfile';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Button, Platform } from 'react-native';

// Foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- Helper to send push notification to a token
async function sendPushNotification(expoPushToken: string) {
  if (!expoPushToken) {
    console.error('No push token to send notification to');
    return;
  }

  console.log('Sending push notification to token:', expoPushToken);
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test Notification',
    body: 'This came from your app!',
    data: { someData: 'goes here' },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    console.log('Push notification response:', data);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// --- Error handler
function handleRegistrationError(errorMessage: string) {
  console.error('Push registration error:', errorMessage);
  alert(errorMessage);
  throw new Error(errorMessage);
}

// --- Register device & get token
async function registerForPushNotificationsAsync() {
  console.log('Starting push notification registration...');
  if (Platform.OS === 'android') {
    console.log('Setting Android notification channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications');
    return;
  }

  console.log('Checking existing permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('Existing permission status:', existingStatus);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('Requesting permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  console.log('Project ID:', projectId);
  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return;
  }

  try {
    console.log('Getting Expo push token...');
    const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo push token obtained:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`Failed to get push token: ${e}`);
  }
}

export default function App() {
  const { profile } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  console.log('profile', profile?.expo_push_token);

  useEffect(() => {
    async function initPushToken() {
      if (profile?.expo_push_token) {
        console.log('Using existing push token from profile:', profile.expo_push_token);
        setExpoPushToken(profile.expo_push_token);
      } else {
        console.log('No push token in profile, registering new one...');
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log('New push token obtained:', token);
            setExpoPushToken(token);

            // TODO: update profile in your backend / Supabase
            // Example:
            // await updateProfile({ expo_push_token: token });
            updateProfileExpoPushToken(profile?.id || '', token);
            console.log('Profile should be updated with new token here');
          }
        } catch (error) {
          console.error('Failed to register push token:', error);
        }
      }
    }

    initPushToken();

    console.log('Setting up notification listeners...');
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      console.log('Removing listeners...');
      notificationListener.remove();
      responseListener.remove();
    };
  }, [profile]);

  return (
    <Button
        title="Press to Send Notification"
        onPress={async () => {
          console.log('Send notification button pressed...');
          await sendPushNotification(expoPushToken);
        }}
      />
  );
}
