import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';

const RECENT = ['อาหารเม็ด', 'CP', 'สด', 'เบทาโกร'];

type Props = { onPick: (q: string) => void };

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
          <Pressable
            key={r}
            onPress={() => onPick(r)}
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
          </Pressable>
        ))}
      </View>
    </View>
  );
}
