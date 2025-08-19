import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function TabUsersManuals() {
  return (
    <SafeAreaView><ThemedText type="title">Welcome 2!</ThemedText></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
