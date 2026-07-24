import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { toIsoDate } from '@/shared/time';
import { SheetShell } from '@/components/sheet';
import type { FeedCollectionModel, FeedKind } from '@/features/feed-collection';
import {
  FEED_DEFAULT_PACK_KG,
  FEED_UNIT_BY_KIND,
  deriveFeedPrices,
  feedPaletteFor,
} from '../feedPalette';
import { DateField } from '@/components/date-selector';
import { feedGlyphFor } from './FeedIcons';
import { FInput } from './FInput';
import { fmt } from '@/utils/fmt';

export type AddFeedSubmitPayload = {
  name: string;
  kind: FeedKind;
  unit: string;
  price: number;
  pricePerKg: number | null;
  fcr: number | null;
  packSizeKg: number | null;
  supplier: string | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

type Props = {
  visible: boolean;
  editing?: FeedCollectionModel | null;
  /** True while the save is in flight — disables + relabels the submit button. */
  saving?: boolean;
  onClose: () => void;
  onSubmit?: (payload: AddFeedSubmitPayload) => void;
};

/** Pack size to seed the field with. Every feed has one now (pack_size_kg is
 *  NOT NULL); when adding, pre-fill the type default (pellet 20 / fresh 30 กก.). */
function packSeed(editing: FeedCollectionModel | null | undefined): string {
  if (editing?.packSizeKg != null) return String(editing.packSizeKg);
  return String(FEED_DEFAULT_PACK_KG[editing?.kind ?? 'pellet']);
}

export function SheetAddFeed({ visible, editing, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<FeedKind>(editing?.kind ?? 'pellet');
  const [fcr, setFcr] = useState(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
  const [packSizeKg, setPackSizeKg] = useState(packSeed(editing));
  const [price, setPrice] = useState(String(editing?.price ?? ''));
  const [supplier, setSupplier] = useState(editing?.supplier ?? '');
  const [effectiveDate, setEffectiveDate] = useState<Date>(
    editing?.updatedAt ? new Date(editing.updatedAt) : new Date(),
  );
  // Errors surface only after the first save attempt, then update live.
  const [submitted, setSubmitted] = useState(false);
  const isEdit = editing != null;
  const unit = FEED_UNIT_BY_KIND[kind];
  const numericPackSizeKg = packSizeKg.trim() !== '' ? Number(packSizeKg) : null;
  const hasPackSize =
    numericPackSizeKg != null && Number.isFinite(numericPackSizeKg) && numericPackSizeKg > 0;
  const numericPriceInput = Number(price);
  const derived =
    Number.isFinite(numericPriceInput) && price.trim() !== ''
      ? deriveFeedPrices(numericPriceInput, hasPackSize ? numericPackSizeKg : null)
      : null;

  // ── validation ──────────────────────────────────────────────────────
  // Name + a positive price are required; optional numerics must be > 0 when
  // filled. Errors only render once `submitted`, then clear live as fixed.
  const isPositive = (s: string) => {
    const n = Number(s);
    return s.trim() !== '' && Number.isFinite(n) && n > 0;
  };
  const nameError = name.trim() === '' ? 'กรุณากรอกชื่ออาหาร' : null;
  const priceError =
    price.trim() === ''
      ? 'กรุณากรอกราคา'
      : !isPositive(price)
        ? 'ราคาต้องมากกว่า 0'
        : null;
  const packError =
    packSizeKg.trim() !== '' && !isPositive(packSizeKg) ? 'ขนาดบรรจุต้องมากกว่า 0' : null;
  const fcrError = fcr.trim() !== '' && !isPositive(fcr) ? 'FCR ต้องมากกว่า 0' : null;
  const hasErrors = Boolean(nameError || priceError || packError || fcrError);

  // The sheet stays mounted inside a Modal, so the useState seeds above run
  // only once and never re-apply. Re-seed the form on every open so edit
  // pre-fills the current feed and add starts clean.
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName(editing?.name ?? '');
      setKind(editing?.kind ?? 'pellet');
      setFcr(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
      setPackSizeKg(packSeed(editing));
      setPrice(String(editing?.price ?? ''));
      setSupplier(editing?.supplier ?? '');
      setEffectiveDate(editing?.updatedAt ? new Date(editing.updatedAt) : new Date());
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible, editing]);

  const handleSubmit = () => {
    if (hasErrors) {
      setSubmitted(true);
      return;
    }
    const numericFcr = fcr.trim() !== '' ? Number(fcr) : null;
    const finalPackSizeKg = hasPackSize ? numericPackSizeKg : null;
    const priceDerived = deriveFeedPrices(
      Number.isFinite(numericPriceInput) ? numericPriceInput : 0,
      finalPackSizeKg,
    );
    onSubmit?.({
      name: name.trim(),
      kind,
      unit,
      price: priceDerived.price,
      pricePerKg: priceDerived.pricePerKg,
      fcr: numericFcr != null && Number.isFinite(numericFcr) ? numericFcr : null,
      packSizeKg: finalPackSizeKg,
      supplier: supplier.trim() !== '' ? supplier.trim() : null,
      effectiveDate: toIsoDate(effectiveDate),
    });
    // The screen closes this sheet once the save succeeds (see hook), so a
    // saving state can show until then — don't close optimistically here.
  };

  const priceLabel = hasPackSize ? `ราคาเริ่มต้นต่อ${unit}` : 'ราคาเริ่มต้น';
  const priceSuffix = `฿/${unit}`;

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.92}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
        <Row gap={12} align="center">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
            >
              {isEdit ? 'แก้ไขรายละเอียด' : 'เพิ่มอาหาร'}
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
              {isEdit ? editing.name : 'กรอกข้อมูลพื้นฐาน + ราคาเริ่มต้น'}
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
        <Field label="ชื่ออาหาร" error={submitted ? nameError : undefined}>
          <FInput
            value={name}
            onChangeText={setName}
            placeholder="เช่น โปรฟีด, ปลาเป็ด"
            invalid={submitted && !!nameError}
          />
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
            onChange={(v) => {
              const next = v as FeedKind;
              // When adding, keep pack size tracking the type default until the
              // user overrides it (pellet 20 ↔ fresh 30 กก.).
              if (!isEdit && (packSizeKg.trim() === '' || packSizeKg === String(FEED_DEFAULT_PACK_KG[kind]))) {
                setPackSizeKg(String(FEED_DEFAULT_PACK_KG[next]));
              }
              setKind(next);
            }}
          />
        </Field>

        <Row gap={10} align="flex-start">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label="หน่วย">
              <UnitBox unit={unit} />
            </Field>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label="FCR" error={submitted ? fcrError : undefined}>
              <FInput
                value={fcr}
                onChangeText={setFcr}
                placeholder="เช่น 1.50"
                numeric
                keyboardType="decimal-pad"
                invalid={submitted && !!fcrError}
              />
            </Field>
          </View>
        </Row>

        <Row gap={10} align="flex-start">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label="ขนาดบรรจุ" error={submitted ? packError : undefined}>
              <FInput
                value={packSizeKg}
                onChangeText={setPackSizeKg}
                placeholder={kind === 'pellet' ? '20' : '30'}
                numeric
                keyboardType="decimal-pad"
                suffix="กก."
                invalid={submitted && !!packError}
              />
            </Field>
          </View>
          {/* Price is set only on add — an existing feed's price is managed from
              the price-history screen (อัปเดตราคา), so edit stays details-only. */}
          {!isEdit ? (
            <View style={{ flex: 1, minWidth: 0 }}>
              <Field label={priceLabel} required error={submitted ? priceError : undefined}>
                <FInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="640"
                  numeric
                  keyboardType="decimal-pad"
                  suffix={priceSuffix}
                  invalid={submitted && !!priceError}
                />
              </Field>
            </View>
          ) : null}
        </Row>

        {!isEdit && hasPackSize && derived?.pricePerKg != null ? (
          <ComputedPriceHint unit="กก." price={derived.pricePerKg} />
        ) : null}

        {!isEdit ? (
          <Field label="วันที่มีผล">
            <DateField value={effectiveDate} onChange={setEffectiveDate} />
          </Field>
        ) : null}

        <Field label="ผู้ขาย">
          <FInput value={supplier} onChangeText={setSupplier} />
        </Field>
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
              {saving ? 'กำลังบันทึก…' : isEdit ? 'บันทึกการแก้ไข' : 'บันทึก'}
            </Text>
          </Pressable>
        </Row>
      </View>
    </SheetShell>
  );
}

/** Read-only unit chip — the buy/pack unit (ถุง/ลัง) is fixed by feed type. */
function UnitBox({ unit }: { unit: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: 52,
        borderRadius: radii.md,
        paddingHorizontal: 14,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1.5,
        borderColor: t.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 15.5, fontFamily: type.familyBold, color: t.ink }}>{unit}</Text>
      <Text
        style={{
          marginLeft: 'auto',
          fontSize: type.sizes.xs,
          color: t.inkMute,
          fontFamily: type.family,
        }}
      >
        ตามประเภท
      </Text>
    </View>
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
    <View style={{ marginBottom: 14 }}>
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

/** Live-computed tracking-unit price, shown once pack size lets us convert
 *  the buy-in input the user just typed. */
function ComputedPriceHint({ unit, price }: { unit: string; price: number }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: 12.5,
        color: t.inkMute,
        fontFamily: type.familySemi,
        marginTop: -6,
        marginBottom: 14,
      }}
    >
      = {fmt.bahtPrecise(price)}/{unit}
    </Text>
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
