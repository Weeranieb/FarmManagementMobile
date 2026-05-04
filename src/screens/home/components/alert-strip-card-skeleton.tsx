import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { Skeleton, SkeletonShape } from '@/components/ui';

/**
 * Skeleton placeholder for `AlertStripCard`. Same horizontal row layout,
 * 1 px neutral border, surfaceAlt fill (so the absence of the strong red
 * doesn't read as a failed render). Layout dimensions are pinned to match
 * the live card so the page doesn't jump on data load.
 */
export function AlertStripCardSkeleton() {
  const { t } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surfaceAlt, borderColor: `${t.ink}1a` },
      ]}
    >
      <SkeletonShape width={10} height={10} radius={5} />
      <View style={styles.textCol}>
        <Skeleton width="55%" height={11} radius={4} />
        <Skeleton width="80%" height={9} radius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonShape width={14} height={14} radius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 12,
  },
});
