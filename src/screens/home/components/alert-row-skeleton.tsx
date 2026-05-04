import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space } from '@/theme/tokens';
import { Skeleton, SkeletonShape } from '@/components/ui';

/**
 * Skeleton placeholder for `AlertRow`. Matches the real row's individual-card
 * chrome (surface bg, neutral dark border, radii.md), icon-circle on left,
 * stacked title/subtitle bars in the middle, and a chevron square on the right.
 */
export function AlertRowSkeleton() {
  const { t } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: t.surface, borderColor: `${t.ink}1a` }]}
    >
      <SkeletonShape width={34} height={34} radius={17} />
      <View style={styles.textCol}>
        <Skeleton width="80%" height={11} radius={4} />
        <Skeleton width="55%" height={9} radius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonShape width={14} height={14} radius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: space[3],
    marginRight: space[2],
  },
});
