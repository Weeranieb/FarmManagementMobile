import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Card, Skeleton, SkeletonShape } from '@/components/ui';

/**
 * Mirrors the four sections of the loaded screen — hero, range, chart, stats,
 * timeline — so the layout doesn't pop when data resolves.
 */
export function LoadingSkeleton() {
  const { t } = useTheme();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 14 }}>
      {/* hero */}
      <Card padded={false}>
        <View
          style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <SkeletonShape width={56} height={56} radius={14} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="40%" height={10} />
            <Skeleton width="55%" height={26} radius={8} />
            <Skeleton width="65%" height={14} radius={7} />
            <Skeleton width="45%" height={10} />
          </View>
        </View>
      </Card>

      {/* range */}
      <Skeleton width="100%" height={48} radius={12} />

      {/* chart */}
      <Card padded={false}>
        <View style={{ padding: 16, gap: 14 }}>
          <Skeleton width="50%" height={11} />
          <Skeleton width="100%" height={190} radius={12} />
        </View>
      </Card>

      {/* stats */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 14,
              padding: 12,
              gap: 8,
            }}
          >
            <Skeleton width="60%" height={9} />
            <Skeleton width="80%" height={18} radius={6} />
            <Skeleton width="70%" height={9} />
          </View>
        ))}
      </View>

      {/* timeline header + rows */}
      <View style={{ gap: 10 }}>
        <Skeleton width="40%" height={14} />
        <Card padded={false}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: t.border,
              }}
            >
              <SkeletonShape width={38} height={38} radius={10} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="70%" height={11} />
                <Skeleton width="40%" height={9} />
              </View>
              <View style={{ width: 60, gap: 6 }}>
                <Skeleton width="100%" height={14} radius={6} />
                <Skeleton width="80%" height={9} />
              </View>
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}
