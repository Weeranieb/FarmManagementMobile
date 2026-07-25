import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FeedPriceHistoryEntry } from '@/features/feed-collection';

type Props = {
  visible: boolean;
  entry: FeedPriceHistoryEntry | null;
  unit: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Centered confirmation dialog for deleting a price-history entry. The delete
 * flow is designed end-to-end but stays unwired until the backend adds
 * DELETE /feed-price-history — see FEATURE_DELETE_PRICE_ENTRY in hook.ts.
 */
export function ConfirmDeleteDialog({ visible, entry, unit, onCancel, onConfirm }: Props) {
  const { t, shadowLg } = useTheme();
  if (!entry) return null;
  const d = new Date(entry.effectiveDate);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable
          onPress={onCancel}
          accessibilityLabel="ยกเลิก"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,15,25,0.55)' }]}
        />
        <View
          style={[
            {
              width: 322,
              maxWidth: '88%',
              backgroundColor: t.surface,
              borderRadius: radii.lg,
              paddingHorizontal: 22,
              paddingTop: 22,
              paddingBottom: 18,
            },
            shadowLg,
          ]}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: t.dangerSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Icon.trash size={24} color={t.danger} />
          </View>
          <Text
            style={{ fontSize: 18, fontFamily: type.familyBold, color: t.ink, marginBottom: 6 }}
          >
            ลบรายการราคานี้?
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: t.inkSoft,
              fontFamily: type.family,
              lineHeight: 20,
              marginBottom: 14,
            }}
          >
            กำลังจะลบราคา{' '}
            <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>
              {fmt.baht(entry.price)}
            </Text>
            <Text style={{ color: t.inkSoft }}>/{unit}</Text> วันที่{' '}
            <Text style={{ fontFamily: type.familyNumSemi, color: t.ink }}>
              {thaiDate.short(d)}
            </Text>{' '}
            ออกจากประวัติ — การกระทำนี้ย้อนกลับไม่ได้
          </Text>
          <Row gap={10}>
            <Tappable
              onPress={onCancel}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 48,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 14 }}>
                ยกเลิก
              </Text>
            </Tappable>
            <Tappable
              onPress={onConfirm}
              accessibilityRole="button"
              style={{
                flex: 1.1,
                height: 48,
                borderRadius: radii.md,
                backgroundColor: t.danger,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 14 }}>
                ลบรายการ
              </Text>
            </Tappable>
          </Row>
        </View>
      </View>
    </Modal>
  );
}
