import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { feedPaletteFor } from '../feedPalette';
import { FeedFishIcon, FeedPelletIcon } from './FeedIcons';

type Props = {
  isAdmin: boolean;
  onAdd?: () => void;
};

export function FeedEmptyState({ isAdmin, onAdd }: Props) {
  const { t } = useTheme();
  const pellet = feedPaletteFor('pellet');
  const fresh = feedPaletteFor('fresh');

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
      {/* Two soft tiles — pellet back-left, fresh front-right, slightly
          overlapping and tilted in opposite directions. Reads as a
          composition, not a single box: hints at both feed types at once. */}
      <View
        style={{
          width: 108,
          height: 96,
          marginBottom: 4,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 6,
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: pellet.soft,
            borderWidth: 1,
            borderColor: hexAlpha(pellet.tileEdge, 0.19),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-6deg' }],
          }}
        >
          <FeedPelletIcon size={30} stroke={1.7} color={pellet.ink} />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 18,
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: fresh.soft,
            borderWidth: 1,
            borderColor: hexAlpha(fresh.tileEdge, 0.19),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '6deg' }],
            shadowColor: '#141c28',
            shadowOpacity: 0.10,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <FeedFishIcon size={30} stroke={1.7} color={fresh.ink} />
        </View>
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

// Build "#rrggbbAA" alpha-suffixed hex from a base "#rrggbb" — the soft tile
// borders in the design use the edge color at ~19% alpha.
function hexAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
