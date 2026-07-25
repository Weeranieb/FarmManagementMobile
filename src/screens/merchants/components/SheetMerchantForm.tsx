import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import type { MerchantModel } from '@/features/merchant';
import { MInput } from './MInput';
import {
  MERCHANT_LIMITS,
  hasMerchantFormErrors,
  validateMerchantForm,
} from '../validation';

export type MerchantFormPayload = {
  name: string;
  contactNumber: string;
  location: string;
};

type Props = {
  visible: boolean;
  /** Non-null → edit mode (pre-filled). Null → add mode (blank). */
  editing?: MerchantModel | null;
  /** True while the save is in flight — disables + relabels the submit button. */
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: MerchantFormPayload) => void;
};

/**
 * Add / edit form for a merchant (ผู้ขาย). Used by the management screen
 * and, in add mode, by the sell-flow picker's inline "เพิ่มผู้ซื้อใหม่" action.
 * Errors surface only after the first save attempt, then clear live as fixed.
 */
export function SheetMerchantForm({ visible, editing, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const isEdit = editing != null;

  const [name, setName] = useState(editing?.name ?? '');
  const [contactNumber, setContactNumber] = useState(editing?.contactNumber ?? '');
  const [location, setLocation] = useState(editing?.location ?? '');
  const [submitted, setSubmitted] = useState(false);

  const errors = validateMerchantForm({ name, contactNumber, location });
  const showErr = submitted;

  // SheetShell keeps children mounted inside a Modal, so the useState seeds run
  // once and never re-apply. Re-seed on the false→true transition so edit
  // pre-fills the active merchant and add starts clean. [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName(editing?.name ?? '');
      setContactNumber(editing?.contactNumber ?? '');
      setLocation(editing?.location ?? '');
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible, editing]);

  const handleSubmit = () => {
    if (hasMerchantFormErrors(errors)) {
      setSubmitted(true);
      return;
    }
    onSubmit({
      name: name.trim(),
      contactNumber: contactNumber.trim(),
      location: location.trim(),
    });
    // The screen closes this sheet once the save succeeds (see hook), so the
    // saving state shows until then — don't close optimistically here.
  };

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} align="center">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
            >
              {isEdit ? 'แก้ไขข้อมูล ผู้ขาย' : 'เพิ่มผู้ขาย'}
            </Text>
            {!isEdit ? (
              <Text
                numberOfLines={1}
                style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}
              >
                ชื่อผู้ซื้อ / ตลาด และช่องทางติดต่อ
              </Text>
            ) : null}
          </View>
          <Tappable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="ปิด"
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.x size={18} color={t.ink} />
          </Tappable>
        </Row>
      </View>

      {/* Plain View (not a ScrollView) so the sheet hugs its content via
          fitContent — a short 3-field form shouldn't reserve a tall fixed panel. */}
      <View style={{ paddingHorizontal: space[5], paddingTop: space[3] }}>
        <Field label="ชื่อผู้ขาย / ตลาด" required error={showErr ? errors.name : undefined}>
          <MInput
            value={name}
            onChangeText={setName}
            placeholder="เช่น เจ๊แดง, ตลาดไท, แพปลาสมชาย"
            maxLength={MERCHANT_LIMITS.name}
            invalid={showErr && !!errors.name}
            leading={<Icon.merchant size={16} color={t.inkSoft} />}
          />
        </Field>

        <Field
          label="เบอร์ติดต่อ"
          hint="ไม่บังคับ · ตัวเลขเท่านั้น สูงสุด 10 หลัก"
          error={showErr ? errors.contactNumber : undefined}
        >
          <MInput
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="08XXXXXXXX"
            keyboardType="number-pad"
            digitsOnly
            maxLength={MERCHANT_LIMITS.contact}
            invalid={showErr && !!errors.contactNumber}
            leading={<Icon.user size={16} color={t.inkSoft} />}
          />
        </Field>

        <Field
          label="ที่อยู่ / ตลาด"
          hint="ไม่บังคับ · เช่น ตำบล/อำเภอ หรือชื่อตลาด"
          error={showErr ? errors.location : undefined}
        >
          <MInput
            value={location}
            onChangeText={setLocation}
            placeholder="เช่น อ.เมือง สมุทรสาคร"
            multiline
            maxLength={MERCHANT_LIMITS.location}
            invalid={showErr && !!errors.location}
            leading={<Icon.globe size={16} color={t.inkSoft} />}
          />
        </Field>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[2] }}>
        <Row gap={space[2] + 2}>
          <Tappable
            onPress={onClose}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 52,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>ยกเลิก</Text>
          </Tappable>
          <Tappable
            onPress={handleSubmit}
            disabled={saving}
            accessibilityRole="button"
            style={{
              flex: 1.6,
              height: 52,
              borderRadius: radii.md,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
              {saving ? 'กำลังบันทึก…' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ขาย'}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ marginBottom: space[4] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>{label}</Text>
        {required ? (
          <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 13 }}>*</Text>
        ) : null}
      </View>
      {children}
      {error ? (
        <Text style={{ fontSize: 11.5, color: t.danger, fontFamily: type.familyMedium, marginTop: 4 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ fontSize: 11.5, color: t.inkMute, fontFamily: type.family, marginTop: 4 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
