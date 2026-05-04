import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space } from '@/theme/tokens';
import { Skeleton, SkeletonShape } from '@/components/ui';

/**
 * Skeleton placeholder for `ActivityRow`. Matches the real row's individual-card
 * chrome (surface bg, neutral dark border, radii.md). Header row shows a small
 * dot + time bar + pond bar; body shows a wider action bar; bottom shows a
 * compact "by" bar.
 */
export function ActivityRowSkeleton() {
  const { t } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: `${t.ink}1a` }]}>
      <View style={styles.headerRow}>
        <SkeletonShape width={10} height={10} radius={5} />
        <Skeleton width={48} height={9} radius={4} style={{ marginLeft: space[2] }} />
        <Skeleton width={56} height={11} radius={4} style={{ marginLeft: space[2] }} />
      </View>
      <Skeleton width="78%" height={12} radius={4} style={{ marginTop: space[2] }} />
      <Skeleton width="40%" height={9} radius={4} style={{ marginTop: space[1] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderWidth: 1,
    borderRadius: radii.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
