import { useAuth } from '@/services/providers/AuthProvider';
import { PushToken } from '@/types/types';
import { getPushToken, insertPushToken, updatePushTokenUserId } from '@/utils/supabase/crudUserPushTokens';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let badgeCount = 0;

/** GRANT PERMISSIONS */
async function grantPermissions() {
  if (!Device.isDevice) throw new Error('Must use physical device for push notifications');

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return 'granted';

  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/** REGISTER PUSH TOKEN */
export async function registerPush(user_id: string): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const finalStatus = await grantPermissions();
  if (finalStatus !== 'granted') throw new Error('Permission not granted to get push token!');

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) throw new Error('Project ID not found');

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const pushToken: PushToken = {
    user_id,
    token: tokenData.data,
    platform: Platform.OS,
    device_id: Device.modelName || 'unknown-device',
  };

  const existingToken = await getPushToken(tokenData.data);

  console.log(tokenData.data);
  console.log(existingToken?.user_id, user_id);

  if (existingToken) {
    if (existingToken.user_id === user_id) {
      // Token already exists for this user, do nothing
      return null;
    } else {
      // Token exists but belongs to another user, update it
      const updated = await updatePushTokenUserId(pushToken.token, user_id);
      if (updated && typeof updated !== 'boolean') return updated.token;
      return null;
    }
  } else {
    // Token does not exist, insert new
    const fresh = await insertPushToken(user_id, pushToken);
    if (fresh && typeof fresh !== 'boolean') return fresh.token;
    return null;
  }
}


/** SEND PUSH NOTIFICATION */
export async function sendPush(tokens: PushToken[]) {
  if (!tokens || tokens.length === 0) return console.log('No tokens to send notification to');

  badgeCount += 1;
  await Notifications.setBadgeCountAsync(badgeCount);

  await Promise.all(
    tokens.map(async (t) => {
      const message = {
        to: t.token,
        sound: 'default',
        title: 'Test Notification',
        body: 'This came from your app!',
        data: { someData: 'goes here' },
        badge: badgeCount,
      };

      try {
        const res = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        const data = await res.json();
        console.log('Notification sent to', t.token, data);
      } catch (err) {
        console.error('Error sending notification to token:', t.token, err);
      }
    })
  );
}

/** COMPONENT */
export default function Push() {
  const { profile, refetchProfile } = useAuth();

  useEffect(() => {
    Notifications.setBadgeCountAsync(0);
    badgeCount = 0;
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    async function initPushToken() {
      try {
        const token = await registerPush(profile?.id || '');
        if (!token) return;
        console.log("refetching");
        await refetchProfile();
        console.log('Inserted or updated push token for user', profile?.id, token);
      } catch (err) {
        console.error('Failed to register push token:', err);
      }
    }

    initPushToken();

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      Notifications.setBadgeCountAsync(0);
      badgeCount = 0;
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [profile, refetchProfile]);

  return (
    <>
    {/* <SafeAreaView>
      <Button
        title="Send Notification"
        onPress={async () => {
          await sendPush(profile?.expo_push_tokens || []);
        }}
      />
    </SafeAreaView> */}
    </>
  );
}
