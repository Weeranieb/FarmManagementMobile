import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { Skeleton } from '@/components/ui';

/**
 * Skeleton placeholder for `StatCard`. Mirrors the real card's chrome
 * exactly — same height (96), padding (14/12), radius (radii.lg), and 1 px
 * `${t.ink}33` border — so the page layout doesn't shift when data arrives.
 *
 * Inside: an icon-square placeholder + title bar on the top row, a value bar
 * (~70 % width) below, and a small subtitle bar (~45 % width) at the bottom.
 */
export function StatCardSkeleton() {
  const { t } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surfaceAlt, borderColor: `${t.ink}1a` },
      ]}
    >
      <View style={styles.topRow}>
        <Skeleton width={16} height={16} radius={4} />
        <Skeleton width={92} height={10} radius={4} style={{ marginLeft: 6 }} />
      </View>
      <Skeleton width="70%" height={20} radius={5} />
      <Skeleton width="45%" height={9} radius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    height: 96,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    justifyContent: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
