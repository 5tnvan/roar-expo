import { Avatar } from '@/components/avatars/Avatar';
import { ThemedText } from '@/components/template/ThemedText';
import { ThemedView } from '@/components/template/ThemedView';
import { useConvosByCallerId } from '@/hooks/useConvosByCallerId';
import { useConvosByUserId } from '@/hooks/useConvosByUserId';
import { useAuth } from '@/services/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function Convos() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

  const {
    convos: sentConvos,
    isLoading: loadingSent,
    fetchMore: fetchMoreSent,
  } = useConvosByCallerId(user?.id || '', 10);

  const {
    convos: receivedConvos,
    isLoading: loadingReceived,
    fetchMore: fetchMoreReceived,
  } = useConvosByUserId(user?.id || '', 10);

  const handleOpenConvo = (convo_id: string) => {
    console.log("session_id", convo_id);
    router.push(`/convo/${convo_id}`);
  };

  const convos = tab === 'sent' ? sentConvos : receivedConvos;
  const isLoading = tab === 'sent' ? loadingSent : loadingReceived;
  const fetchMore = tab === 'sent' ? fetchMoreSent : fetchMoreReceived;

  const emptyMessage =
    tab === 'sent'
      ? "When you talk to someone's assistant."
      : "When someone talks to your assistant.";

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-900">
      {/* Tabs */}
      <ThemedView className="flex-row justify-around border-b border-zinc-500/5">
        <TouchableOpacity className='p-4' onPress={() => setTab('sent')}>
          <Text className={`text-lg font-semibold ${tab === 'sent' ? 'text-blue-600' : 'text-gray-500'}`}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className='p-4' onPress={() => setTab('received')}>
          <Text className={`text-lg font-semibold ${tab === 'received' ? 'text-blue-600' : 'text-gray-500'}`}>
            Requests
          </Text>
        </TouchableOpacity>
      </ThemedView>

      

                  

      {/* Convo List */}
      {isLoading && convos.length === 0 ? (
        <ActivityIndicator size="large" className="mt-12" />
      ) : convos.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <ThemedText className="text-center">{emptyMessage}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={convos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            isLoading ? (
              <View className="py-4">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const person = tab === 'sent' ? item.user : item.caller;
            return (
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 m-2 border-b border-zinc-500/15 dark:bg-zinc-900"
                onPress={() => handleOpenConvo(item.id)}
              >
                <View className='flex-row '>
                  <Avatar uri={person.avatar_url} size={48} showTick={false} />
                <View className="ml-3">
                  <ThemedText className="font-semibold text-lg">{person.full_name}</ThemedText>
                  <ThemedText className="text-gray-500 text-sm">@{person.handle}</ThemedText>
                  <ThemedText className="text-gray-400 text-xs">
                    {new Date(item.created_at).toLocaleString()}
                  </ThemedText>
                </View>
                </View>
                
                <Ionicons name='chevron-forward-sharp' size={20} color={isDark ? "white" : "black"}/>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}