import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { Skeleton, SkeletonShape } from '@/components/ui';

function SkeletonRow({ divider }: { divider: boolean }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space[3],
        padding: space[3],
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.border,
        alignItems: 'flex-start',
      }}
    >
      <SkeletonShape width={34} height={34} radius={10} />
      <View style={{ flex: 1 }}>
        <Skeleton width="46%" height={11} />
        <Skeleton width="72%" height={12} style={{ marginTop: 7 }} />
        <Skeleton width="34%" height={9} style={{ marginTop: 7 }} />
      </View>
    </View>
  );
}

/** First-paint placeholder — two day groups of three rows, mirroring the
 *  loaded layout so nothing jumps when data lands. */
export function HistorySkeleton() {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: space[4], paddingTop: space[3] }}>
      {[0, 1].map((g) => (
        <View key={g} style={{ marginTop: g === 0 ? 0 : space[4] + 2 }}>
          <Skeleton width={g === 0 ? '24%' : '38%'} height={10} radius={5} />
          <View
            style={{
              marginTop: space[2],
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            {[0, 1, 2].map((i) => (
              <SkeletonRow key={i} divider={i < 2} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
