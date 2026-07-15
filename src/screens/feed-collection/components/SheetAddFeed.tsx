import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { warnInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { toIsoDate } from '@/shared/time';
import { SheetShell } from '@/components/sheet';
import type { FeedCollectionModel, FeedKind } from '@/features/feed-collection';
import { FEED_PILL_TONE_BY_KIND, FEED_UNIT_BY_KIND, feedPaletteFor } from '../feedPalette';
import { DateField } from '@/components/date-selector';
import { feedGlyphFor } from './FeedIcons';
import { FInput } from './FInput';

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
  const { t, mode } = useTheme();
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<FeedKind>(editing?.kind ?? 'pellet');
  const [fcr, setFcr] = useState(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
  const [price, setPrice] = useState(editing?.price != null ? String(editing.price) : '');
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const isEdit = editing != null;
  const unit = FEED_UNIT_BY_KIND[kind];
  const HeaderGlyph = feedGlyphFor(kind);
  // Match the list card + actions sheet: soft pill-tone tile (pellet=warn,
  // fresh=brand), not the saturated feed palette. The tile tracks the live
  // `kind` selection so toggling type previews the identity.
  const headerTone = FEED_PILL_TONE_BY_KIND[kind];
  const headerTileBg = headerTone === 'warn' ? t.warnSoft : t.brandSoft;
  const headerGlyphColor = headerTone === 'warn' ? warnInk(mode, t) : t.brandInk;

  // The sheet stays mounted inside a Modal, so the useState seeds above run
  // only once (when editing == null) and never re-apply. Re-seed the form on
  // every open so edit pre-fills the current feed and add starts clean.
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName(editing?.name ?? '');
      setKind(editing?.kind ?? 'pellet');
      setFcr(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
      setPrice(editing?.price != null ? String(editing.price) : '');
      setEffectiveDate(new Date());
    }
    wasVisible.current = visible;
  }, [visible, editing]);

  const handleSubmit = () => {
    const numericPrice = Number(price);
    const numericFcr = fcr.trim() !== '' ? Number(fcr) : null;
    onSubmit?.({
      name: name.trim(),
      kind,
      unit,
      price: Number.isFinite(numericPrice) ? numericPrice : 0,
      fcr: numericFcr != null && Number.isFinite(numericFcr) ? numericFcr : null,
      effectiveDate: toIsoDate(effectiveDate),
    });
    onClose();
  };

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.92}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
        <Row gap={12} align="center">
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: headerTileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeaderGlyph size={22} stroke={2} color={headerGlyphColor} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
            >
              {editing ? editing.name : 'เพิ่มอาหาร'}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: type.sizes.xs,
                color: t.inkMute,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {isEdit ? 'แก้ไขรายละเอียด · ราคาแก้ไขแยก' : 'กรอกข้อมูลพื้นฐาน + ราคาเริ่มต้น'}
            </Text>
          </View>
          <Pressable
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
          </Pressable>
        </Row>
      </View>

      <ScrollView
        delaysContentTouches={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {!isEdit ? <SectionLabel>รายละเอียด</SectionLabel> : null}

        <Field label="ชื่ออาหาร">
          <FInput value={name} onChangeText={setName} placeholder="เช่น โปรฟีด, ปลาเป็ด" />
        </Field>

        <Field label="ประเภท">
          <Segmented
            value={kind}
            options={(['pellet', 'fresh'] as const).map((k) => {
              const Glyph = feedGlyphFor(k);
              const palette = feedPaletteFor(k);
              return {
                value: k,
                label: k === 'pellet' ? 'เม็ด' : 'สด',
                icon: (selected: boolean) => (
                  <Glyph size={16} stroke={2} color={selected ? palette.tileEdge : undefined} />
                ),
              };
            })}
            onChange={(v) => setKind(v as FeedKind)}
          />
          <UnitHint unit={unit} />
        </Field>

        <Field label="FCR" optional>
          <FInput
            value={fcr}
            onChangeText={setFcr}
            placeholder="เช่น 1.50"
            numeric
            keyboardType="decimal-pad"
          />
        </Field>

        {!isEdit ? (
          <>
            <View
              style={{ height: 1, backgroundColor: t.border, marginTop: 4, marginBottom: 18 }}
            />
            <SectionLabel>ราคาเริ่มต้น</SectionLabel>

            <Field label="ราคา">
              <FInput
                value={price}
                onChangeText={setPrice}
                placeholder="32"
                hero
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

function UnitHint({ unit }: { unit: string }) {
  const { t } = useTheme();
  return (
    <Row gap={6} align="center" style={{ marginTop: 8 }}>
      <Icon.lock size={12} color={t.inkMute} />
      <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}>
        หน่วยขายกำหนดตามประเภท
      </Text>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: radii.xs,
          backgroundColor: t.surfaceAlt,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        <Text style={{ fontSize: type.sizes.xs, color: t.inkSoft, fontFamily: type.familySemi }}>
          {unit}
        </Text>
      </View>
    </Row>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: type.sizes.sm,
        fontFamily: type.familyBold,
        color: t.inkMute,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
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

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; icon?: (selected: boolean) => React.ReactNode }[];
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {opt.icon ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  // unselected glyphs inherit the muted ink for consistent
                  // tone with the label below.
                  opacity: sel ? 1 : 0.7,
                }}
              >
                {opt.icon(sel)}
              </View>
            ) : null}
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
