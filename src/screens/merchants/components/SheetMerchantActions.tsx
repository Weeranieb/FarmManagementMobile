import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { dangerInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import type { MerchantModel } from '@/features/merchant';

type Props = {
  visible: boolean;
  merchant: MerchantModel | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** Actions for a single merchant: edit (primary) + delete (demoted, destructive). */
export function SheetMerchantActions({ visible, merchant, onClose, onEdit, onDelete }: Props) {
  const { t, mode, shadow } = useTheme();
  const danger = dangerInk(mode, t);

  if (!merchant) {
    return <SheetShell visible={visible} onClose={onClose} fitContent showClose />;
  }

  const meta = [merchant.location, merchant.contactNumber].filter(Boolean).join(' · ');

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent showClose>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        {/* Identity */}
        <Row gap={space[3]} style={{ marginBottom: space[4] }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radii.md,
              backgroundColor: t.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.brandInk }}>
              {merchant.name.slice(0, 1)}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: space[1], justifyContent: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: type.sizes.lg, fontFamily: type.familyBold, color: t.ink, lineHeight: 24 }}
            >
              {merchant.name}
            </Text>
            {meta ? (
              <Text
                numberOfLines={1}
                style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}
              >
                {meta}
              </Text>
            ) : null}
          </View>
        </Row>

        {/* Primary — edit, given a soft brand card */}
        <Tappable
          onPress={onEdit}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[3],
            padding: space[3],
            marginBottom: space[3],
            borderRadius: radii.md,
            backgroundColor: t.brandSoft,
            borderWidth: 1.5,
            borderColor: t.brand,
            ...shadow,
          }}
        >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radii.sm,
                backgroundColor: t.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.edit size={22} color={t.brandInk} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: t.brandInk }}>
                แก้ไขข้อมูล
              </Text>
              <Text
                style={{ fontSize: type.sizes.sm, color: t.brandInk, fontFamily: type.family, marginTop: 2 }}
              >
                ชื่อ · เบอร์ติดต่อ · ที่อยู่
              </Text>
            </View>
            <Icon.chevR size={18} color={t.brandInk} />
        </Tappable>

        {/* Destructive — demoted, separated, no chevron */}
        <View style={{ height: 1, backgroundColor: t.border, marginVertical: space[2] }} />
        <Tappable
          onPress={onDelete}
          android_ripple={{ color: t.surfaceAlt }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[3],
            paddingHorizontal: space[2],
            paddingVertical: space[3],
            borderRadius: radii.md,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.sm,
              backgroundColor: t.dangerSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.trash size={18} color={danger} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: danger }}>
              ลบผู้ขาย
            </Text>
            <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}>
              การขายที่บันทึกไว้แล้วจะไม่ถูกลบ
            </Text>
          </View>
        </Tappable>
      </View>
    </SheetShell>
  );
}
