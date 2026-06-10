import { View } from 'react-native';
import { Skeleton, SkeletonShape } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space } from '@/theme/tokens';

export function ActivityRowSkeleton({ divider = false }: { divider?: boolean }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space[3],
        paddingVertical: space[3],
        paddingHorizontal: space[3],
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.border,
        alignItems: 'flex-start',
      }}
    >
      <SkeletonShape width={32} height={32} radius={radii.sm} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width={130} height={10} />
        <Skeleton width="80%" height={12} />
        <Skeleton width={92} height={9} />
      </View>
    </View>
  );
}
