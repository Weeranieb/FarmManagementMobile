import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { FILTERS, type FilterId } from '../constants';

type Props = {
  filter: FilterId;
  counts: Record<FilterId, number>;
  disabled?: boolean;
  onChange: (id: FilterId) => void;
};

/**
 * Type-filter chip row — a pure client-side Array.filter over rows the screen
 * already holds (Home Redesign § ④: no search/analytics Phase 1 can't back).
 * Chips for kinds with zero rows are disabled rather than hidden so the set
 * stays spatially stable while filtering.
 */
export function FilterChips({ filter, counts, disabled = false, onChange }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
      <ScrollView
        delaysContentTouches={false}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: space[3] + 2,
          paddingVertical: space[2] + 1,
          gap: space[2],
          alignItems: 'center',
        }}
      >
        {FILTERS.map((f) => {
          const sel = f.id === filter;
          const n = counts[f.id] ?? 0;
          const off = disabled || (f.id !== 'all' && n === 0);
          return (
            // Chrome lives on the wrapper View — function styles (and some
            // static ones) on Pressable get mangled by react-native-css-interop.
            <View
              key={f.id}
              style={{
                borderRadius: radii.pill,
                backgroundColor: sel ? t.brand : t.surface,
                borderWidth: 1,
                borderColor: sel ? t.brand : t.border,
                opacity: off ? 0.5 : 1,
                overflow: 'hidden',
              }}
            >
              <Tappable
                feedback="opacity"
                onPress={() => !off && onChange(f.id)}
                disabled={off}
                accessibilityRole="button"
                accessibilityState={{ selected: sel, disabled: off }}
                android_ripple={{ color: t.surfaceAlt }}
                style={{
                  height: 34,
                  paddingHorizontal: 13,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space[1] + 2,
                }}
              >
                <Text
                  style={{
                    fontSize: type.sizes.sm,
                    fontFamily: sel ? type.familyBold : type.familyMedium,
                    color: sel ? t.surface : off ? t.inkMute : t.inkSoft,
                  }}
                >
                  {f.label}
                </Text>
                <Text
                  style={{
                    fontSize: type.sizes.xs,
                    fontFamily: type.familyNumSemi,
                    color: sel ? t.surface : t.inkMute,
                    opacity: sel ? 0.85 : 1,
                  }}
                >
                  {n}
                </Text>
              </Tappable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
