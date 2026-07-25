import { View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { CELL_HIGHLIGHT, VIBRANT_BRAND } from '../constants';

type Props = {
  /** # of distinct days in the current month with drafts. */
  daysCount: number;
  /** # of (pond, day) edits in the current month — the unit save commits. */
  editsCount: number;
  /** # of month edits holding an out-of-range value. When > 0 the save button
   *  is disabled and the left copy swaps to a red validation warning. */
  invalidCount?: number;
  onSavePress: () => void;
  bottomInset?: number;
};

export function SaveBar({
  daysCount,
  editsCount,
  invalidCount = 0,
  onSavePress,
  bottomInset = 0,
}: Props) {
  const { t } = useTheme();
  const hasInvalid = invalidCount > 0;
  const enabled = editsCount > 0 && !hasInvalid;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 18 + bottomInset,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: t.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: hasInvalid ? CELL_HIGHLIGHT.errorRing : t.border,
          paddingHorizontal: 14,
          paddingVertical: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
          elevation: 6,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10.5,
              fontFamily: type.familyBold,
              color: hasInvalid ? CELL_HIGHLIGHT.errorInk : t.inkMute,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {hasInvalid ? 'ค่าผิดเงื่อนไข' : 'รออัปโหลด'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
            {hasInvalid ? (
              <>
                <Text
                  style={{ fontSize: 13, fontFamily: type.familyNumBold, color: CELL_HIGHLIGHT.errorInk }}
                >
                  {invalidCount}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: type.familyBold,
                    color: CELL_HIGHLIGHT.errorInk,
                    marginLeft: 4,
                  }}
                >
                  รายการต้องแก้ก่อน
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 13, fontFamily: type.familyNumBold, color: t.ink }}>
                  {daysCount}
                </Text>
                <Text
                  style={{ fontSize: 13, fontFamily: type.familyBold, color: t.ink, marginLeft: 4 }}
                >
                  วัน ·
                </Text>
                <Text
                  style={{ fontSize: 13, fontFamily: type.familyNumBold, color: t.ink, marginLeft: 4 }}
                >
                  {editsCount}
                </Text>
                <Text
                  style={{ fontSize: 13, fontFamily: type.familyBold, color: t.ink, marginLeft: 4 }}
                >
                  รายการ
                </Text>
              </>
            )}
          </View>
        </View>
        <Tappable
          disabled={!enabled}
          onPress={onSavePress}
          style={{
            height: 46,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: enabled ? VIBRANT_BRAND[600] : t.surfaceSunk,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            opacity: enabled ? 1 : 0.85,
            shadowColor: enabled ? VIBRANT_BRAND[600] : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: enabled ? 0.45 : 0,
            shadowRadius: 14,
            elevation: enabled ? 4 : 0,
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !enabled }}
          accessibilityLabel={`บันทึกทั้งเดือน ${editsCount} รายการ`}
        >
          <Icon.check size={15} color={enabled ? '#fff' : t.borderStrong} />
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: type.familyBold,
              color: enabled ? '#fff' : t.borderStrong,
            }}
          >
            บันทึกทั้งเดือน
          </Text>
          <View
            style={{
              backgroundColor: enabled ? 'rgba(255,255,255,.18)' : t.border,
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: type.familyNumBold,
                color: enabled ? '#fff' : t.borderStrong,
              }}
            >
              {editsCount}
            </Text>
          </View>
        </Tappable>
      </View>
    </View>
  );
}
