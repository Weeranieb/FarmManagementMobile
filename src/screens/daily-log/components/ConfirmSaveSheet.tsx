import { Modal, Pressable, View, Text } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { VIBRANT_BRAND, fmtTh, thMonth } from '../constants';
import type { PondRow as PondRowType } from '../hook';

type Props = {
  visible: boolean;
  ponds: PondRowType[];
  selectedDate: Date;
  onClose: () => void;
  onConfirm: () => void;
};

type SummaryRow = {
  key: 'pellet' | 'fresh' | 'death';
  label: string;
  unit: string;
  total: number;
  edits: number;
};

function buildSummary(ponds: PondRowType[]): SummaryRow[] {
  const dirty = ponds.filter((p) => p.state === 'dirty');
  const num = (x: number | '') => (typeof x === 'number' ? x : 0);

  const pelletEdits = dirty.filter((p) => num(p.v.pm) > 0 || num(p.v.pe) > 0).length;
  const freshEdits = dirty.filter((p) => num(p.v.fresh) > 0).length;
  const deathEdits = dirty.filter((p) => num(p.v.death) > 0).length;

  const pelletTotal = dirty.reduce((acc, p) => acc + num(p.v.pm) + num(p.v.pe), 0);
  const freshTotal = dirty.reduce((acc, p) => acc + num(p.v.fresh), 0);
  const deathTotal = dirty.reduce((acc, p) => acc + num(p.v.death), 0);

  return [
    { key: 'pellet', label: 'อาหารเม็ด', unit: 'kg', total: pelletTotal, edits: pelletEdits },
    { key: 'fresh', label: 'เหยื่อสด', unit: 'kg', total: freshTotal, edits: freshEdits },
    { key: 'death', label: 'ปลาตาย', unit: 'ตัว', total: deathTotal, edits: deathEdits },
  ];
}

export function ConfirmSaveSheet({ visible, ponds, selectedDate, onClose, onConfirm }: Props) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const dirty = ponds.filter((p) => p.state === 'dirty').length;
  const summary = buildSummary(ponds);

  const dateLabel = `${selectedDate.getDate()} ${thMonth(selectedDate.getMonth()).slice(0, 3)}. ${selectedDate.getFullYear() + 543}`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(11,18,32,.42)',
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(220)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: t.surface,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingBottom: 14 + insets.bottom,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 4 }}>
            <View
              style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: t.border }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 6,
              paddingBottom: 14,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: VIBRANT_BRAND[50],
                borderWidth: 1,
                borderColor: VIBRANT_BRAND[100],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.check size={20} color={VIBRANT_BRAND[700]} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  lineHeight: 22,
                }}
              >
                ยืนยันการบันทึก
              </Text>
              <Text style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 2, lineHeight: 17 }}>
                บันทึก{' '}
                <Text
                  style={{ fontFamily: type.familyNumBold, color: t.ink }}
                >
                  {dirty}
                </Text>{' '}
                บ่อ ที่แก้ไขในวันที่{' '}
                <Text style={{ fontFamily: type.familyBold, color: t.ink }}>{dateLabel}</Text>
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="ปิด"
            >
              <Icon.x size={14} color={t.inkSoft} />
            </Pressable>
          </View>

          {/* Summary card */}
          <View
            style={{
              marginHorizontal: 14,
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: t.border,
              backgroundColor: t.surfaceAlt,
              overflow: 'hidden',
            }}
          >
            {summary.map((r, i) => (
              <View
                key={r.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: t.border,
                  backgroundColor: t.surface,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    backgroundColor: t.surfaceAlt,
                    borderWidth: 1,
                    borderColor: t.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: type.familyNumBold,
                      color: t.ink,
                    }}
                  >
                    {r.edits}
                  </Text>
                </View>
                <Text
                  style={{ flex: 1, fontSize: 13.5, fontFamily: type.familySemi, color: t.ink }}
                >
                  {r.label}
                </Text>
                <Text
                  style={{ fontSize: 14, fontFamily: type.familyNumBold, color: t.ink }}
                >
                  {fmtTh(r.total)}{' '}
                  <Text
                    style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}
                  >
                    {r.unit}
                  </Text>
                </Text>
              </View>
            ))}
          </View>

          {/* Offline note */}
          <View
            style={{
              marginHorizontal: 14,
              marginBottom: 14,
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 11,
              backgroundColor: t.warnSoft,
              borderWidth: 1,
              borderColor: t.warnSoft,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <Icon.alert size={14} color={t.warn} />
            <Text style={{ fontSize: 11.5, color: t.warn, lineHeight: 17, flex: 1 }}>
              ออฟไลน์อยู่ — ข้อมูลจะถูกเก็บไว้ในเครื่องและอัปโหลดเมื่อกลับมาออนไลน์
            </Text>
          </View>

          {/* Actions */}
          <View
            style={{
              paddingHorizontal: 14,
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                height: 48,
                paddingHorizontal: 22,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.inkSoft }}>
                ยกเลิก
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 13,
                backgroundColor: VIBRANT_BRAND[600],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Icon.check size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: type.familyBold }}>
                บันทึก {dirty} บ่อ
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
