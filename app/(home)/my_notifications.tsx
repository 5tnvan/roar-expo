import { Avatar } from "@/components/avatars/Avatar";
import { useNotifications } from "@/hooks/useNotifications";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function MyNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    fetchMore,
    endReached,
  } = useNotifications();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (loading && notifications.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const renderItem = ({ item }: { item: typeof notifications[0] }) => {
    let avatar = null;

    // Notification visuals
    if (item.type === "notif_call_msg") {
      avatar = (
        <View className="w-10 h-10 rounded-full bg-gray-400 mr-3 items-center justify-center">
          <Ionicons name="ear-outline" size={24} color={isDark ? "white" : "black"} />
        </View>
      );
    } else if (item.type === "notif_views" || item.type === "notif_shares") {
      avatar = (
        <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 items-center justify-center">
          <Ionicons name="flame-outline" size={24} color="orange" />
        </View>
      );
    } else {
      avatar = item.avatar_url ? (
        <View className="mr-2">
          <Avatar uri={item.avatar_url} size={36} />
        </View>
      ) : (
        <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
      );
    }

    return (
      <Link href={item.deep_link as any ?? "/"} asChild>
        <TouchableOpacity
          className={`flex-row items-center p-3 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {avatar}
          <View className="flex-1">
            <Text className={`text-base ${isDark ? "text-white" : "text-black"}`}>
              {item.message}
            </Text>
            <Text className="text-gray-400 text-xs">
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"} p-4`}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text className="text-blue-500">Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!endReached) fetchMore();
        }}
        ListFooterComponent={
          !endReached ? <ActivityIndicator className="mt-2" /> : null
        }
      />
    </View>
  );
}
