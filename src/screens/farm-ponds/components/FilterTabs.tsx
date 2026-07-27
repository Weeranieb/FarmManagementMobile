import { ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import type { PondCounts, PondFilter } from '../hook';

/** Label keys resolved inside the component so a language switch re-renders. */
const ITEMS: { id: PondFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'active', labelKey: 'pond.active' },
  { id: 'maintenance', labelKey: 'pond.maintenance' },
];

type Props = {
  filter: PondFilter;
  counts: PondCounts;
  onChange: (f: PondFilter) => void;
};

export function FilterTabs({ filter, counts, onChange }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <ScrollView
      delaysContentTouches={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
    >
      {ITEMS.map((it) => {
        const selected = it.id === filter;
        return (
          <Tappable
            key={it.id}
            feedback="opacity"
            onPress={() => onChange(it.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor: selected ? t.ink : t.surface,
              borderWidth: 1,
              borderColor: selected ? t.ink : t.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text
              style={{
                fontFamily: type.familySemi,
                fontSize: 13,
                color: selected ? t.bg : t.inkSoft,
              }}
            >
              {tx(it.labelKey)}
            </Text>
            <Text
              style={{
                fontFamily: type.familyNumSemi,
                fontSize: 13,
                color: selected ? t.bg : t.inkSoft,
                opacity: 0.7,
              }}
            >
              {counts[it.id]}
            </Text>
          </Tappable>
        );
      })}
    </ScrollView>
  );
}
