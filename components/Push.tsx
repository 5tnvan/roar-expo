import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Button, Platform, Text, View } from 'react-native';

// Notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  console.log('Sending push notification to token:', expoPushToken);
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
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

function handleRegistrationError(errorMessage: string) {
  console.error('Push registration error:', errorMessage);
  alert(errorMessage);
  throw new Error(errorMessage);
}

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
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {
    console.log('Registering for push notifications...');
    registerForPushNotificationsAsync()
      .then(token => {
        console.log('Push token received in component:', token);
        setExpoPushToken(token ?? '');
      })
      .catch((error: any) => {
        console.error('Error in registration:', error);
        setExpoPushToken(`${error}`);
      });

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
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          console.log('Send notification button pressed...');
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
