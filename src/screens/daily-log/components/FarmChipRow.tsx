import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { CHROME } from '../constants';

type Props = {
  farmName: string;
  savedCount: number;
  total: number;
  onPress?: () => void;
};

export function FarmChipRow({ farmName, savedCount, total, onPress }: Props) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: CHROME.farm,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: t.surface,
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="เลือกฟาร์ม"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 34,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          maxWidth: 240,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontFamily: type.familyBold,
            color: t.ink,
            letterSpacing: 0.1,
            flexShrink: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {farmName}
        </Text>
        <Icon.arrowDown size={13} color={t.inkSoft} />
      </Pressable>

      <View style={{ flex: 1 }} />

      <View style={{ alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyNumBold,
              color: t.fill,
            }}
          >
            {savedCount}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: t.borderStrong,
              marginHorizontal: 4,
            }}
          >
            /
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyNumBold,
              color: t.ink,
            }}
          >
            {total}
          </Text>
          <Text style={{ fontSize: 11, color: t.inkSoft, marginLeft: 4 }}>บ่อ</Text>
        </View>
      </View>
    </View>
  );
}
