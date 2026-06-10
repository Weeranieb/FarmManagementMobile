import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Btn } from '@/components/ui';
import { BottomSheet } from '@/components/sheet';
import type { MerchantModel } from '@/features/merchant';

/**
 * Bottom-sheet picker for merchants. Empty state surfaces the web app as the
 * source of truth — merchants are created there and synced back. The sheet
 * scrolls when the list is long; backdrop tap + X button both close.
 *
 * `onWebAppPress` is optional so callers can wire it to whatever web entry
 * point makes sense (env-driven URL via Linking.openURL, etc.). When omitted
 * the empty state still shows the headline + body but hides the CTA — better
 * to drop a non-functional button than to ship a dead Linking call.
 */
export function MerchantSheet({
  visible,
  merchants,
  selectedId,
  onPick,
  onClose,
  onWebAppPress,
}: {
  visible: boolean;
  merchants: MerchantModel[];
  selectedId: number | null;
  onPick: (merchantId: number) => void;
  onClose: () => void;
  onWebAppPress?: () => void;
}) {
  const { t } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="เลือกผู้ซื้อ / ตลาด" maxHeight="72%">
      {merchants.length === 0 ? (
        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 8,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: t.surfaceAlt ?? t.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.user size={26} color={t.inkMute} stroke={1.4} />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 15, fontFamily: type.familyBold, color: t.ink }}>
              ยังไม่มีผู้ซื้อ
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: t.inkMute,
                fontFamily: type.family,
                textAlign: 'center',
                maxWidth: 260,
                lineHeight: 19,
              }}
            >
              เพิ่มรายชื่อผู้ซื้อ / ตลาดได้จากเว็บแอปก่อน แล้วซิงค์กลับมาในมือถือ
            </Text>
          </View>
          {onWebAppPress ? (
            <View style={{ marginTop: 4 }}>
              <Btn
                tone="sell"
                variant="ghost"
                onPress={onWebAppPress}
                leading={<Icon.globe size={14} color={t.sellInk} />}
              >
                เปิดเว็บแอป
              </Btn>
            </View>
          ) : null}
        </View>
      ) : (
        <ScrollView
          style={{ maxHeight: 480 }}
          contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {merchants.map((m) => {
            const sel = m.id === selectedId;
            return (
              <Pressable
                key={m.id}
                onPress={() => onPick(m.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: radii.md,
                  backgroundColor: sel ? t.sellSoft : t.surface,
                  borderWidth: 1.5,
                  borderColor: sel ? t.sell : t.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: sel ? t.sell + '25' : (t.surfaceAlt ?? t.surface),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: type.familyNumBold,
                      fontSize: 14,
                      color: sel ? t.sellInk : t.inkSoft,
                    }}
                  >
                    {m.name.slice(0, 1)}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontFamily: type.familySemi,
                      fontSize: 14,
                      color: t.ink,
                    }}
                    numberOfLines={1}
                  >
                    {m.name}
                  </Text>
                  {m.location || m.contactNumber ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: t.inkMute,
                        fontFamily: type.family,
                      }}
                      numberOfLines={1}
                    >
                      {[m.location, m.contactNumber].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
                {sel ? <Icon.check size={18} color={t.sellInk} stroke={2.4} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}
