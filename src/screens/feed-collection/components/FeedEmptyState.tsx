import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { FEED_ORANGE } from '../feedPalette';
import { FeedPackageIcon } from './FeedIcons';

type Props = {
  isAdmin: boolean;
  onAdd?: () => void;
};

export function FeedEmptyState({ isAdmin, onAdd }: Props) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingTop: 48,
        paddingHorizontal: 32,
        paddingBottom: 24,
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 26,
          backgroundColor: FEED_ORANGE.soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FeedPackageIcon size={38} stroke={1.5} color={FEED_ORANGE.ink} />
      </View>
      <View style={{ alignItems: 'center', gap: 6, maxWidth: 290 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: type.familyBold,
            color: t.ink,
            lineHeight: 26,
            textAlign: 'center',
          }}
        >
          ยังไม่มีอาหารในคลัง
        </Text>
        <Text
          style={{
            fontSize: 13.5,
            color: t.inkMute,
            fontFamily: type.family,
            lineHeight: 22,
            textAlign: 'center',
          }}
        >
          {isAdmin
            ? 'เพิ่มสูตรอาหารที่ฟาร์มของคุณใช้ — ราคาและประวัติจะถูกอ้างอิงในการบันทึกประจำวันโดยอัตโนมัติ'
            : 'ผู้ดูแลฟาร์มยังไม่ได้เพิ่มรายการอาหาร — เมื่อมีรายการแล้วจะแสดงที่นี่'}
        </Text>
      </View>
      {isAdmin ? (
        <Pressable
          onPress={onAdd}
          style={{
            marginTop: 6,
            height: 48,
            paddingHorizontal: 22,
            borderRadius: radii.md,
            backgroundColor: t.brand,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
          accessibilityRole="button"
        >
          <Icon.plus size={18} color="#fff" stroke={2.2} />
          <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
            เพิ่มอาหารรายการแรก
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
