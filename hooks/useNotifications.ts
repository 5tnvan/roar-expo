import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";

export type AppNotification = {
  id: string;
  created_at: string;
  type: string;
  message: string;
  handle?: string;
  avatar_url?: string;
  deep_link?: string;
  read: boolean;
};

const PAGE_SIZE = 10;

async function formatNotification(notif: any): Promise<AppNotification> {
  let handle = "Someone";
  let avatar_url = "";
  let app_link = "";

  if (notif.profile_id) {
    const { data: profile } = await supabase
      .from("profile")
      .select("handle, avatar_url")
      .eq("id", notif.profile_id)
      .single();
    handle = profile?.handle ?? handle;
    avatar_url = profile?.avatar_url ?? "";
  }

  if (notif.capsule_id) {
    app_link = `/capsule/${notif.capsule_id}`;
  } else if (notif.profile_id && !notif.convo_session_id) {
    app_link = `/profile/${notif.profile_id}`;
  } else if (notif.convo_session_id) {
    const { data } = await supabase
      .from("convo_session")
      .select("convo_id")
      .eq("id", notif.convo_session_id)
      .single();
    app_link = data?.convo_id ? `/convo/${data.convo_id}` : `/home`;
  }

  let message = "You have a new notification";
  switch (notif.type) {
    case "notif_call_assist":
      message = `@${handle} called your assistant`;
      break;
    case "notif_call_msg":
      message = `A caller call-in your message`;
      break;
    case "notif_like":
      message = `Yay, @${handle} approved your message`;
      break;
    case "notif_views":
      message = `Your post crossed ${notif.capsule_views ?? 0} views`;
      break;
    case "notif_shares":
      message = `Your post was shared ${notif.capsule_shares ?? 0} times`;
      break;
  }

  return {
    ...notif,
    message,
    handle,
    avatar_url,
    deep_link: app_link,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [endReached, setEndReached] = useState(false);

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!user?.id || (endReached && !reset)) return;
      setLoading(true);

      const from = reset ? 0 : page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
        return;
      }

      const formatted = await Promise.all(data.map(formatNotification));

      setNotifications((prev) => (reset ? formatted : [...prev, ...formatted]));
      setPage((prev) => (reset ? 1 : prev + 1));
      setEndReached(data.length < PAGE_SIZE);
      setLoading(false);
    },
    [user?.id, page, endReached]
  );

  const fetchMore = () => fetchNotifications();

  const refetch = () => {
    setPage(0);
    setEndReached(false);
    return fetchNotifications(true);
  };

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("owner_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
    }

    await refetch();
  }, [user?.id]);

  // Listen to realtime changes for this user
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`realtime_notifications_user_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `owner_id=eq.${user.id}`,
        },
        async (payload) => {
          const formatted = await formatNotification(payload.new);
          setNotifications((prev) => [formatted, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    endReached,
    markAllAsRead,
    fetchMore,
    refetch,
  };
}
