import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';

type Props = { onPick: (s: string) => void };

export function SearchSuggestions({ onPick }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  // Example queries — a pond name plus the two commonest fish, localized so an
  // English user isn't offered Thai terms the search then can't match.
  const recent = ['A2', tx('fish.nil'), tx('fish.kaphong')];
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: type.familyBold,
          color: t.inkSoft,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {tx('farmPonds.recentSearches')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {recent.map((r) => (
          <Tappable
            key={r}
            feedback="opacity"
            onPress={() => onPick(r)}
            accessibilityRole="button"
            accessibilityLabel={tx('common.searchFor', { query: r })}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon.clock size={12} color={t.inkSoft} />
            <Text style={{ fontFamily: type.familyMedium, fontSize: 13, color: t.inkSoft }}>
              {r}
            </Text>
          </Tappable>
        ))}
      </View>
    </View>
  );
}
