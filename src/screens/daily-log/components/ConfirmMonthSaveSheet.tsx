import { Modal, Pressable, View, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { GROUP_LIGHT, VIBRANT_BRAND, fmtTh, thMonth } from '../constants';
import type { MonthSummary } from '../hook';
import { useSheetSlideIn } from './useSheetSlideIn';

type Props = {
  visible: boolean;
  summary: MonthSummary;
  /** Bottom safe-area inset, sourced from the screen (outside this Modal).
   *  `useSafeAreaInsets()` called from inside an Android Modal reads
   *  stale/zero on the Modal's own first render — its native window hasn't
   *  received insets yet — so the sheet takes this as a prop instead. */
  bottomInset?: number;
  /** Show the "· N บ่อ" pond count in the header. Defaults on for the farm
   *  editor (spans many ponds); the single-pond ledger passes false. */
  showPondCount?: boolean;
  /** Show the offline-queue reassurance note. Defaults on; screens whose save
   *  is a live upsert with no offline queue (e.g. the pond ledger) pass false. */
  showOfflineNote?: boolean;
  onClose: () => void;
  /** Fires the (non-blocking) save. The parent closes this sheet immediately
   *  and reports the server round-trip via a status toast. */
  onConfirm: () => void;
};

// Label + unit come from GROUP_LIGHT so the sheet never drifts from the table
// header / numpad (e.g. เหยื่อสด → "ลัง").
const FEED_ROWS = (['pellet', 'fresh', 'death'] as const).map((key) => ({
  key,
  label: GROUP_LIGHT[key].title,
  unit: GROUP_LIGHT[key].unit,
}));

function monthLabel(month: string): string {
  // month = "YYYY-MM" → "กรกฎาคม 2569"
  const year = Number(month.slice(0, 4));
  const monthIdx = Number(month.slice(5, 7)) - 1;
  return `${thMonth(monthIdx)} ${year + 543}`;
}

export function ConfirmMonthSaveSheet({
  visible,
  summary,
  bottomInset = 0,
  showPondCount = true,
  showOfflineNote = true,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTheme();
  // Sheet has no fixed height (content-driven) — slide from the full screen
  // height so it always starts off-screen regardless of content size.
  const { height: screenH } = useWindowDimensions();
  const sheetAnim = useSheetSlideIn(screenH);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={{ flex: 1, backgroundColor: 'rgba(11,18,32,.42)' }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: t.surface,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              paddingBottom: 14 + bottomInset,
            },
            sheetAnim,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: t.border }} />
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
              <Icon.calendar size={20} color={VIBRANT_BRAND[700]} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink, lineHeight: 22 }}
              >
                บันทึกข้อมูลเดือน{monthLabel(summary.month)}
              </Text>
              <Text style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 2, lineHeight: 17 }}>
                แก้ไข{' '}
                <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>
                  {summary.daysEdited}
                </Text>{' '}
                วัน
                {showPondCount ? (
                  <>
                    {' '}·{' '}
                    <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>
                      {summary.pondCount}
                    </Text>{' '}
                    บ่อ
                  </>
                ) : null}
              </Text>
            </View>
            <Tappable
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
            </Tappable>
          </View>

          {/* Summary card — totals by feed type */}
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
            {FEED_ROWS.map((r, i) => {
              const cell = summary[r.key];
              return (
                <View
                  key={r.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: t.border,
                    backgroundColor: t.surface,
                  }}
                >
                  <Text
                    style={{ flex: 1, fontSize: 13.5, fontFamily: type.familySemi, color: t.ink }}
                  >
                    {r.label}
                    {cell.days > 0 ? (
                      <Text
                        style={{ fontSize: 11.5, color: t.inkMute, fontFamily: type.familyNum }}
                      >
                        {'  '}({fmtTh(cell.days)} วัน)
                      </Text>
                    ) : null}
                  </Text>
                  <Text style={{ fontSize: 15, fontFamily: type.familyNumBold, color: t.ink }}>
                    {fmtTh(cell.total)}{' '}
                    <Text style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}>
                      {r.unit}
                    </Text>
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Offline note */}
          {showOfflineNote ? (
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
          ) : null}

          {/* Actions */}
          <View style={{ paddingHorizontal: 14, flexDirection: 'row', gap: 10 }}>
            <Tappable
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
            </Tappable>
            <Tappable
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
              accessibilityRole="button"
            >
              <Icon.check size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: type.familyBold }}>
                บันทึก {fmtTh(summary.daysEdited)} วัน
              </Text>
            </Tappable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
