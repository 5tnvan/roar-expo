import AppButton from '@/components/buttons/AppButton';
import PlanUnlimitedCard from '@/components/PlanUnlimitedCard';
import { Text, View } from 'react-native';

export default function App() {
    return (
        <View className='p-4 gap-3'>
            {/* Header */}
            <View>
                <Text className="text-lg font-bold text-black dark:text-white">
                    Upgrade
                </Text>
                <Text className="text-lg text-black dark:text-white opacity-65">
                    Upgrade to enjoy uninterrupted service.
                </Text>
            </View>
            <View className="plan w-full gap-4">
                {/* Plan Card */}
                <PlanUnlimitedCard
                    title="Unlimited"
                    dataUsage={{ progress: 1, used: "Unlimited" }}
                    tokenUsage={{ progress: 1, used: "Unlimited" }}
                />
            </View>
            <AppButton
                title="Upgrade Now"
                variant="primary"
                onPress={() => { }}
                className='w-full'
            />
        </View>
    );
}