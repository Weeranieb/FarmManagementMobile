import { Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Skeleton, Tappable } from '@/components/ui';
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

const GLYPH_BOX = 54;

function Glyph({ id, color }: { id: SecondaryActionId; color: string }) {
  if (id === 'fill') return <Icon.plus size={24} color={color} stroke={2.2} />;
  if (id === 'move') return <Icon.swap size={24} color={color} />;
  return <Icon.tag size={24} color={color} />;
}

const ITEMS: { id: SecondaryActionId; label: string }[] = [
  { id: 'fill', label: 'เติมปลา' },
  { id: 'move', label: 'ย้ายปลา' },
  { id: 'sell', label: 'ขายปลา' },
];

/**
 * Quick actions — เติม / ย้าย / ขาย. Each is a soft, semantic-colored glyph
 * button (green fill / blue move / purple sell) with the label beneath, sitting
 * directly on the page — deliberately NOT boxed in bordered cards, so the row
 * reads as light "shortcuts" subordinate to the Daily Log hero above, and the
 * semantic action colors carry the identity instead of five look-alike cards.
 *
 * NativeWind/css-interop note: function-form Pressable styles get their props
 * dropped by the JSX runtime, so the Pressable style stays a static object.
 */
export function SecondaryActionRow({ onPress }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {ITEMS.map((it) => {
        const tone = tonePair(it.id, t);
        return (
          <View key={it.id} style={{ flex: 1, borderRadius: radii.md, overflow: 'hidden' }}>
            <Tappable
              onPress={onPress ? () => onPress(it.id) : undefined}
              accessibilityRole="button"
              accessibilityLabel={it.label}
              android_ripple={{ color: tone.soft }}
              style={{ alignItems: 'center', paddingVertical: space[2], gap: 8 }}
            >
              <View
                style={{
                  width: GLYPH_BOX,
                  height: GLYPH_BOX,
                  borderRadius: radii.lg,
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
                  fontSize: type.sizes.sm,
                  fontFamily: type.familySemi,
                  color: t.ink,
                }}
              >
                {it.label}
              </Text>
            </Tappable>
          </View>
        );
      })}
    </View>
  );
}

export function SecondaryActionRowSkeleton() {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: space[2], gap: 8 }}>
          <Skeleton width={GLYPH_BOX} height={GLYPH_BOX} radius={radii.lg} />
          <Skeleton width={54} height={12} />
        </View>
      ))}
    </View>
  );
}
