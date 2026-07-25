import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { SheetShell } from '@/components/sheet';
import type { MerchantModel } from '@/features/merchant';

/**
 * Bottom-sheet picker for merchants. Traders are now created in-app, so the
 * sheet leads with an inline "เพิ่มผู้ซื้อใหม่" action (both in the list and as
 * the empty-state CTA) — no more web-app hand-off. Picking a row selects it;
 * `onAddNew` hands control to the sell flow to open the create form.
 */
export function MerchantSheet({
  visible,
  merchants,
  selectedId,
  onPick,
  onAddNew,
  onClose,
}: {
  visible: boolean;
  merchants: MerchantModel[];
  selectedId: number | null;
  onPick: (merchantId: number) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  const { t } = useTheme();
  const isEmpty = merchants.length === 0;

  return (
    <SheetShell visible={visible} onClose={onClose} title="เลือกผู้ซื้อ / ตลาด" heightPct={0.72}>
      {isEmpty ? (
        <View style={{ paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: t.sellSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.merchant size={26} color={t.sellInk} stroke={1.6} />
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
              เพิ่มรายชื่อผู้ซื้อ / ตลาดได้เลย แล้วเลือกใช้ในการขายครั้งนี้ได้ทันที
            </Text>
          </View>
          <Tappable
            onPress={onAddNew}
            accessibilityRole="button"
            style={{
              marginTop: 4,
              height: 48,
              paddingHorizontal: 20,
              borderRadius: radii.md,
              backgroundColor: t.sell,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon.plus size={18} color="#fff" stroke={2.2} />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
              เพิ่มผู้ซื้อใหม่
            </Text>
          </Tappable>
        </View>
      ) : (
        <ScrollView
          delaysContentTouches={false}
          style={{ maxHeight: 480 }}
          contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add-new — dashed sell-tinted row, kept at the top so it's always reachable */}
          <Tappable
            onPress={onAddNew}
            accessibilityRole="button"
            style={{
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: radii.md,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: t.sell + '66',
              borderStyle: 'dashed',
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
                backgroundColor: t.sellSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.plus size={18} color={t.sellInk} stroke={2.2} />
            </View>
            <Text style={{ flex: 1, fontFamily: type.familySemi, fontSize: 14, color: t.sellInk }}>
              เพิ่มผู้ซื้อใหม่
            </Text>
          </Tappable>

          {merchants.map((m) => {
            const sel = m.id === selectedId;
            return (
              <Tappable
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
                    style={{ fontFamily: type.familySemi, fontSize: 14, color: t.ink }}
                    numberOfLines={1}
                  >
                    {m.name}
                  </Text>
                  {m.location || m.contactNumber ? (
                    <Text
                      style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}
                      numberOfLines={1}
                    >
                      {[m.location, m.contactNumber].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
                {sel ? <Icon.check size={18} color={t.sellInk} stroke={2.4} /> : null}
              </Tappable>
            );
          })}
        </ScrollView>
      )}
    </SheetShell>
  );
}
