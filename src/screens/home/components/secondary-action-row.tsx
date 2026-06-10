import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import type { ThemePalette } from '@/theme/tokens';

export type SecondaryActionId = 'fill' | 'move' | 'sell';

type Props = {
  onPress?: (id: SecondaryActionId) => void;
};

function tonePair(id: SecondaryActionId, t: ThemePalette) {
  if (id === 'fill') return { soft: t.fillSoft, ink: t.fillInk };
  if (id === 'move') return { soft: t.moveSoft, ink: t.moveInk };
  return { soft: t.sellSoft, ink: t.sellInk };
}

const ICON_BOX = 34;
const TILE_MIN_HEIGHT = 92;
const TILE_PADDING = 12;

function Glyph({ id, color }: { id: SecondaryActionId; color: string }) {
  if (id === 'fill') return <Icon.plus size={18} color={color} stroke={2.2} />;
  if (id === 'move') return <Icon.swap size={18} color={color} />;
  return <Icon.tag size={18} color={color} />;
}

const ITEMS: { id: SecondaryActionId; label: string }[] = [
  { id: 'fill', label: 'เติมปลา' },
  { id: 'move', label: 'ย้ายปลา' },
  { id: 'sell', label: 'ขายปลา' },
];

/**
 * Three equal-weight tiles under the primary Daily Log card. Icon chip pinned
 * top-left, label bottom-left.
 *
 * Two rendering constraints shape this markup:
 * 1. Visual chrome (background / border / shadow) lives on the outer <View>,
 *    NOT the Pressable — react-native-css-interop (NativeWind's JSX runtime)
 *    silently drops style props passed to Pressable as a function style.
 *    For the same reason the Pressable style below must stay a STATIC object.
 * 2. `minHeight` sits on the Pressable itself: a `flex: 1` child inside a
 *    parent sized only by `minHeight` collapses to content height in Yoga,
 *    which crammed the chip + label to the top of the tile.
 */
export function SecondaryActionRow({ onPress }: Props) {
  const { t, shadow } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space[2] }}>
      {ITEMS.map((it) => {
        const tone = tonePair(it.id, t);
        return (
          <View
            key={it.id}
            style={[
              {
                flex: 1,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.borderStrong,
                borderRadius: radii.md,
                overflow: 'hidden',
              },
              shadow,
            ]}
          >
            <Pressable
              onPress={onPress ? () => onPress(it.id) : undefined}
              accessibilityRole="button"
              accessibilityLabel={it.label}
              android_ripple={{ color: t.surfaceAlt }}
              style={{
                minHeight: TILE_MIN_HEIGHT - 2,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: TILE_PADDING,
                gap: space[4] + 2,
              }}
            >
              <View
                style={{
                  width: ICON_BOX,
                  height: ICON_BOX,
                  borderRadius: radii.sm,
                  backgroundColor: tone.soft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Glyph id={it.id} color={tone.ink} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: type.sizes.sm + 1,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  letterSpacing: -0.1,
                }}
              >
                {it.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export function SecondaryActionRowSkeleton() {
  const { t, shadow } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space[2] }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            {
              flex: 1,
              minHeight: TILE_MIN_HEIGHT,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.borderStrong,
              borderRadius: radii.md,
              padding: TILE_PADDING,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            },
            shadow,
          ]}
        >
          <Skeleton width={ICON_BOX} height={ICON_BOX} radius={radii.sm} />
          <Skeleton width={60} height={12} />
        </View>
      ))}
    </View>
  );
}
