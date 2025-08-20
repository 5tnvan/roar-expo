import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function ModalUsersManuals() {
  return (
    <SafeAreaView><ThemedText type="title">Users manual</ThemedText></SafeAreaView>
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
