import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';

type Props = { onPick: (q: string) => void };

export function SearchSuggestions({ onPick }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  // Example queries, localized so an English user isn't handed Thai terms.
  const RECENT = [tx('daily.pelletFeed'), 'CP', tx('feed.kindFresh'), 'Betagro'];
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
        {tx('feedCollection.recentSearches')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {RECENT.map((r) => (
          <Tappable
            key={r}
            onPress={() => onPick(r)}
            feedback="opacity"
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
            <Text style={{ fontSize: 13, fontFamily: type.familyMedium, color: t.inkSoft }}>{r}</Text>
          </Tappable>
        ))}
      </View>
    </View>
  );
}
