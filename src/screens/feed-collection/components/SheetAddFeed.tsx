import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/screens/account-info/components/SheetShell';
import type { FeedCollectionModel, FeedKind } from '@/features/feed-collection';
import { FEED_UNIT_BY_KIND } from '../feedPalette';
import { DateField } from './DateField';

export type AddFeedSubmitPayload = {
  name: string;
  kind: FeedKind;
  unit: string;
  price: number;
  fcr: number | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

type Props = {
  visible: boolean;
  editing?: FeedCollectionModel | null;
  onClose: () => void;
  onSubmit?: (payload: AddFeedSubmitPayload) => void;
};

export function SheetAddFeed({ visible, editing, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<FeedKind>(editing?.kind ?? 'pellet');
  const [fcr, setFcr] = useState(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
  const [price, setPrice] = useState(editing?.price != null ? String(editing.price) : '');
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const isEdit = editing != null;
  const unit = FEED_UNIT_BY_KIND[kind];

  const handleSubmit = () => {
    const numericPrice = Number(price);
    const numericFcr = fcr.trim() !== '' ? Number(fcr) : null;
    onSubmit?.({
      name: name.trim(),
      kind,
      unit,
      price: Number.isFinite(numericPrice) ? numericPrice : 0,
      fcr: numericFcr != null && Number.isFinite(numericFcr) ? numericFcr : null,
      effectiveDate: toYmd(effectiveDate),
    });
    onClose();
  };

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.92}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
        <Row justify="space-between">
          <View>
            <Text style={{ fontFamily: type.familyBold, fontSize: 18, color: t.ink }}>
              {isEdit ? 'แก้ไขรายละเอียด' : 'เพิ่มอาหาร'}
            </Text>
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}>
              {isEdit ? 'ชื่อ · ประเภท · FCR (ราคาแก้ไขแยก)' : 'กรอกข้อมูลพื้นฐาน + ราคาเริ่มต้น'}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
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
          </Pressable>
        </Row>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="ชื่ออาหาร">
          <FInput value={name} onChangeText={setName} />
        </Field>

        <Field label="ประเภท">
          <Segmented
            value={kind}
            options={[
              { value: 'pellet', label: 'เม็ด' },
              { value: 'fresh', label: 'สด' },
            ]}
            onChange={(v) => setKind(v as FeedKind)}
          />
        </Field>

        <Row gap={10}>
          <View style={{ flex: 1 }}>
            <Field label="หน่วย">
              <FInput value={unit} onChangeText={noop} editable={false} />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="FCR" optional>
              <FInput value={fcr} onChangeText={setFcr} numeric keyboardType="decimal-pad" />
            </Field>
          </View>
        </Row>

        {!isEdit ? (
          <>
            <Field label="ราคาเริ่มต้น">
              <FInput
                value={price}
                onChangeText={setPrice}
                placeholder="32"
                big
                numeric
                keyboardType="decimal-pad"
                suffix={`฿/${unit}`}
              />
            </Field>

            <Field label="วันที่มีผล">
              <DateField value={effectiveDate} onChange={setEffectiveDate} />
            </Field>
          </>
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: t.border,
          backgroundColor: t.surface,
        }}
      >
        <Row gap={10}>
          <Pressable
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
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            accessibilityRole="button"
            style={{
              flex: 1.6,
              height: 52,
              borderRadius: radii.md,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>บันทึก</Text>
          </Pressable>
        </Row>
      </View>
    </SheetShell>
  );
}

function noop() {
  // unit field is locked to the type — onChangeText needs a stable handler.
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>{label}</Text>
        {!optional ? (
          <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 13 }}>*</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type FInputProps = {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  suffix?: string;
  big?: boolean;
  numeric?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
};

function FInput({
  value,
  onChangeText,
  placeholder,
  suffix,
  big,
  numeric,
  editable = true,
  keyboardType = 'default',
}: FInputProps) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: 52,
        borderRadius: radii.md,
        backgroundColor: editable ? t.surface : t.surfaceAlt,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: editable ? 1 : 0.55,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.inkMute}
        editable={editable}
        keyboardType={keyboardType}
        autoCorrect={false}
        style={{
          flex: 1,
          color: t.ink,
          fontFamily: numeric ? (big ? type.familyNumBold : type.familyNum) : type.family,
          fontSize: big ? 22 : 15.5,
          letterSpacing: big ? -0.3 : 0,
          paddingVertical: 0,
        }}
      />
      {suffix ? (
        <Text
          style={{
            fontSize: big ? 14 : 13,
            color: t.inkMute,
            fontFamily: type.familyNum,
          }}
        >
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.surfaceAlt,
        padding: 4,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      {options.map((opt) => {
        const sel = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            style={{
              flex: 1,
              height: 44,
              borderRadius: radii.sm,
              backgroundColor: sel ? t.surface : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: sel ? t.ink : t.inkSoft,
                fontFamily: sel ? type.familyBold : type.familyMedium,
                fontSize: 14,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
