import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';

const RECENT: string[] = ['A2', 'ปลานิล', 'ปลากะพง'];

type Props = { onPick: (s: string) => void };

export function SearchSuggestions({ onPick }: Props) {
  const { t } = useTheme();
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
        ค้นหาล่าสุด
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {RECENT.map((r) => (
          <Tappable
            key={r}
            feedback="opacity"
            onPress={() => onPick(r)}
            accessibilityRole="button"
            accessibilityLabel={`ค้นหา ${r}`}
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
