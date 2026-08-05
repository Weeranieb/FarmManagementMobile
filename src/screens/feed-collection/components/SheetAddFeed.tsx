import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { toIsoDate } from '@/shared/time';
import { SheetShell } from '@/components/sheet';
import type { FeedCollectionModel, FeedKind } from '@/features/feed-collection';
import { FEED_UNIT_BY_KIND, feedPaletteFor } from '../feedPalette';
import { DateField } from '@/components/date-selector';
import { feedGlyphFor } from './FeedIcons';
import { FInput } from './FInput';

export type AddFeedSubmitPayload = {
  name: string;
  kind: FeedKind;
  unit: string;
  /** Price per pack — ฿/ถุง for pellet, ฿/ลัง for fresh. */
  price: number;
  fcr: number | null;
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

export function SheetAddFeed({ visible, editing, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<FeedKind>(editing?.kind ?? 'pellet');
  const [fcr, setFcr] = useState(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
  const [price, setPrice] = useState(String(editing?.price ?? ''));
  const [supplier, setSupplier] = useState(editing?.supplier ?? '');
  const [effectiveDate, setEffectiveDate] = useState<Date>(
    editing?.updatedAt ? new Date(editing.updatedAt) : new Date(),
  );
  // Errors surface only after the first save attempt, then update live.
  const [submitted, setSubmitted] = useState(false);
  const isEdit = editing != null;
  const unit = FEED_UNIT_BY_KIND[kind];
  const numericPriceInput = Number(price);

  // ── validation ──────────────────────────────────────────────────────
  // Name + a positive price are required; optional numerics must be > 0 when
  // filled. Errors only render once `submitted`, then clear live as fixed.
  const isPositive = (s: string) => {
    const n = Number(s);
    return s.trim() !== '' && Number.isFinite(n) && n > 0;
  };
  const nameError = name.trim() === '' ? tx('feedCollection.form.nameRequired') : null;
  const priceError =
    price.trim() === ''
      ? tx('feedCollection.form.priceRequired')
      : !isPositive(price)
        ? tx('feedCollection.form.priceGtZero')
        : null;
  const fcrError = fcr.trim() !== '' && !isPositive(fcr) ? tx('feedCollection.form.fcrGtZero') : null;
  const hasErrors = Boolean(nameError || priceError || fcrError);

  // The sheet stays mounted inside a Modal, so the useState seeds above run
  // only once and never re-apply. Re-seed the form on every open so edit
  // pre-fills the current feed and add starts clean.
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName(editing?.name ?? '');
      setKind(editing?.kind ?? 'pellet');
      setFcr(editing?.fcr != null ? editing.fcr.toFixed(2) : '');
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
    onSubmit?.({
      name: name.trim(),
      kind,
      unit,
      price: Number.isFinite(numericPriceInput) ? numericPriceInput : 0,
      fcr: numericFcr != null && Number.isFinite(numericFcr) ? numericFcr : null,
      supplier: supplier.trim() !== '' ? supplier.trim() : null,
      effectiveDate: toIsoDate(effectiveDate),
    });
    // The screen closes this sheet once the save succeeds (see hook), so a
    // saving state can show until then — don't close optimistically here.
  };

  const priceLabel = tx('feedCollection.form.priceStart');
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
              {isEdit ? tx('feedCollection.form.editTitle') : tx('feedCollection.form.addTitle')}
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
              {isEdit ? editing.name : tx('feedCollection.form.addSubtitle')}
            </Text>
          </View>
          <Tappable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={tx('common.close')}
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

      <ScrollView
        delaysContentTouches={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label={tx('feedCollection.form.nameLabel')} error={submitted ? nameError : undefined}>
          <FInput
            value={name}
            onChangeText={setName}
            placeholder={tx('feedCollection.form.namePlaceholder')}
            invalid={submitted && !!nameError}
          />
        </Field>

        <Field label={tx('feedCollection.form.kindLabel')}>
          <Segmented
            value={kind}
            options={(['pellet', 'fresh'] as const).map((k) => {
              const Glyph = feedGlyphFor(k);
              const palette = feedPaletteFor(k);
              return {
                value: k,
                label: k === 'pellet' ? tx('feed.kindPellet') : tx('feed.kindFresh'),
                icon: (selected: boolean) => (
                  <Glyph size={16} stroke={2} color={selected ? palette.tileEdge : undefined} />
                ),
              };
            })}
            onChange={(v) => setKind(v as FeedKind)}
          />
        </Field>

        <Row gap={10} align="flex-start">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label={tx('feedCollection.form.unitLabel')}>
              <UnitBox unit={unit} />
            </Field>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field label="FCR" error={submitted ? fcrError : undefined}>
              <FInput
                value={fcr}
                onChangeText={setFcr}
                placeholder={tx('feedCollection.form.unitPlaceholder')}
                numeric
                keyboardType="decimal-pad"
                invalid={submitted && !!fcrError}
              />
            </Field>
          </View>
        </Row>

        {/* Price is set only on add — an existing feed's price is managed from
            the price-history screen (อัปเดตราคา), so edit stays details-only. */}
        {!isEdit ? (
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
        ) : null}

        {!isEdit ? (
          <Field label={tx('feedCollection.form.effectiveDate')}>
            <DateField value={effectiveDate} onChange={setEffectiveDate} />
          </Field>
        ) : null}

        <Field label={tx('feedCollection.form.supplier')}>
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
            <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>
              {tx('common.cancel')}
            </Text>
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
              {saving
                ? tx('common.saving')
                : isEdit
                  ? tx('feedCollection.form.submitEdit')
                  : tx('common.save')}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}

/** Read-only unit chip — the buy/pack unit (ถุง/ลัง) is fixed by feed type. */
function UnitBox({ unit }: { unit: string }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
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
        {tx('feedCollection.form.byKind')}
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
          <Tappable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            feedback="opacity"
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
          </Tappable>
        );
      })}
    </View>
  );
}
