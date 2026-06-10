import { View } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space } from '@/theme/tokens';

export function DailyLogCardSkeleton() {
  const { t } = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: radii.lg + 2,
        padding: space[4] + 2,
      }}
    >
      <Skeleton width={120} height={9} />
      <View style={{ height: 8 }} />
      <Skeleton width={170} height={18} radius={5} />
      <View style={{ height: 16 }} />
      <Skeleton width={70} height={32} radius={6} />
      <View style={{ height: 10 }} />
      <Skeleton width="100%" height={8} />
      <View style={{ height: 14 }} />
      <Skeleton width={90} height={8} />
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Skeleton width={72} height={24} radius={12} />
        <Skeleton width={72} height={24} radius={12} />
        <Skeleton width={72} height={24} radius={12} />
      </View>
      <View style={{ height: 14 }} />
      <Skeleton width="100%" height={54} radius={radii.md} />
    </View>
  );
}
