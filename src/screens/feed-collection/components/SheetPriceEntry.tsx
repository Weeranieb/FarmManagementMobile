import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { dangerInk } from '@/theme/ink';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { toIsoDate } from '@/shared/time';
import { SheetShell } from '@/components/sheet';
import type { FeedCollectionModel, FeedPriceHistoryEntry } from '@/features/feed-collection';
import { FEED_DEFAULT_PACK_KG, deriveFeedPrices, feedPaletteFor } from '../feedPalette';
import { DateField, type DateFieldHandle } from '@/components/date-selector';
import { feedGlyphFor } from './FeedIcons';
import { FInput } from './FInput';

export type PriceEntryMode = 'add' | 'edit';

type Props = {
  visible: boolean;
  mode: PriceEntryMode;
  feed: FeedCollectionModel | null;
  /** Edit mode: the entry being edited. */
  entry?: FeedPriceHistoryEntry | null;
  /** Chronological (oldest → newest) price history. Drives the client-side
   *  date-collision check and the diff baseline. Callers that haven't loaded
   *  history (feed-collection list) can omit it — the backend still rejects
   *  duplicate dates on create. */
  entries?: FeedPriceHistoryEntry[];
  onClose: () => void;
  /** Add mode submit — `id` is the feed-collection id. */
  onSubmit?: (payload: {
    id: number;
    price: number;
    pricePerKg: number | null;
    effectiveDate: string;
  }) => void;
  /** Edit mode submit. */
  onSubmitEdit?: (payload: {
    entryId: number;
    price: number;
    pricePerKg: number | null;
    effectiveDate: string;
  }) => void;
  /** Add-mode date collision: overwrite the colliding entry's price instead. */
  onOverwrite?: (payload: {
    entryId: number;
    price: number;
    pricePerKg: number | null;
  }) => void;
  /** Edit only — renders the demoted "ลบรายการราคา" button. Leave undefined
   *  until the backend ships DELETE /feed-price-history. */
  onDelete?: () => void;
  /** True while the save is in flight — disables + relabels the submit button. */
  saving?: boolean;
};

/**
 * Mode-aware price-entry sheet — one sheet for both เพิ่มราคา (add: date
 * defaults to today) and แก้ไขรายการราคา (edit: price + effective date come in
 * prefilled). One day can hold only one price (API rule), so a colliding date
 * blocks the save; in add mode the user may instead overwrite the existing
 * entry's price.
 */
export function SheetPriceEntry({
  visible,
  mode,
  feed,
  entry = null,
  entries,
  onClose,
  onSubmit,
  onSubmitEdit,
  onOverwrite,
  onDelete,
  saving = false,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const isEdit = mode === 'edit' && entry != null;
  const currentPrice = feed?.price ?? null;

  const [price, setPrice] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const dateRef = useRef<DateFieldHandle>(null);

  // Pack size is a feed-level attribute (kg per ถุง/ลัง) edited in the details
  // sheet — the price sheet only reads it to convert the buy-in price to ฿/กก.
  // Fall back to the type default for legacy feeds saved before it existed.
  const storedPack = feed?.packSizeKg;
  const packSizeKg =
    storedPack != null && Number.isFinite(storedPack) && storedPack > 0
      ? storedPack
      : feed
        ? FEED_DEFAULT_PACK_KG[feed.kind]
        : null;
  const hasPackSize = packSizeKg != null && packSizeKg > 0;

  // Modal keeps this sheet mounted, so useState seeds run only once. Re-seed
  // from the mode/entry on each open — otherwise reopening for a different
  // entry (or switching add↔edit) shows stale values.
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current && feed) {
      // Stored price is already the per-pack (ถุง/ลัง) price. Round the seed —
      // it can carry float noise — but it's only a starting value the user edits.
      const seedBuyIn = (v: number) => String(Number(v.toFixed(2)));
      if (isEdit && entry) {
        setPrice(seedBuyIn(entry.price));
        setEffectiveDate(new Date(entry.effectiveDate));
      } else {
        setPrice(currentPrice != null ? seedBuyIn(currentPrice) : '');
        setEffectiveDate(new Date());
      }
    }
    wasVisible.current = visible;
  }, [visible, isEdit, entry, currentPrice, feed]);

  // Newest entry — marks the edited row as "ราคาปัจจุบัน" in the recap tile.
  const newest = entries && entries.length > 0 ? entries[entries.length - 1] : null;
  const isCurrentEntry = isEdit && entry != null && newest != null && entry.id === newest.id;

  // Diff baseline: edit compares to the nearest older entry, add to the current price.
  const baseline = useMemo(() => {
    if (!isEdit) return currentPrice;
    if (!entries || !entry) return null;
    const older = entries.filter(
      (e) => e.id !== entry.id && e.effectiveDate < entry.effectiveDate,
    );
    return older.length > 0 ? older[older.length - 1]!.price : null;
  }, [isEdit, currentPrice, entries, entry]);

  const priceNum = Number(price);
  const priceValid = Number.isFinite(priceNum) && priceNum > 0;
  // `price` is the buy-in input (per ถุง/กก.) when a pack size is known —
  // convert to the tracking-unit price for validation, diffing, and submit.
  const derived =
    feed && priceValid ? deriveFeedPrices(priceNum, hasPackSize ? packSizeKg : null) : null;
  const trackingPrice = derived?.price ?? null;

  const diff = useMemo(() => {
    if (baseline == null || baseline === 0 || trackingPrice == null) return null;
    const delta = trackingPrice - baseline;
    return { delta, pct: (delta / baseline) * 100 };
  }, [baseline, trackingPrice]);

  // One price per day — a chosen date that collides with another entry blocks
  // the save (backend enforces this on create; edit must self-police).
  const collidingEntry = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const ymd = toIsoDate(effectiveDate);
    return (
      entries.find((e) => e.effectiveDate === ymd && (!isEdit || e.id !== entry?.id)) ?? null
    );
  }, [entries, effectiveDate, isEdit, entry]);
  const collision = collidingEntry != null;

  if (!feed) {
    return (
      <SheetShell visible={visible} onClose={onClose} fitContent>
        {null}
      </SheetShell>
    );
  }

  const palette = feedPaletteFor(feed.kind);
  const Glyph = feedGlyphFor(feed.kind);

  const handleSubmit = () => {
    if (!priceValid || collision || !derived) return;
    if (isEdit && entry) {
      onSubmitEdit?.({
        entryId: entry.id,
        price: derived.price,
        pricePerKg: derived.pricePerKg,
        effectiveDate: toIsoDate(effectiveDate),
      });
    } else {
      onSubmit?.({
        id: feed.id,
        price: derived.price,
        pricePerKg: derived.pricePerKg,
        effectiveDate: toIsoDate(effectiveDate),
      });
    }
    // Screen closes this sheet on save success (see hook), so the button can
    // show a saving state until then — don't close optimistically here.
  };

  const handleOverwrite = () => {
    if (!priceValid || !collidingEntry || !derived) return;
    onOverwrite?.({
      entryId: collidingEntry.id,
      price: derived.price,
      pricePerKg: derived.pricePerKg,
    });
  };

  // Overwrite only makes sense in add mode — in edit, merging two entries
  // would need the (not-yet-existing) DELETE endpoint.
  const showOverwriteFooter = collision && !isEdit && onOverwrite != null;
  const submitDisabled = !priceValid || collision || saving;

  const recapPrice = isEdit && entry ? entry.price : currentPrice;
  const recapDate = isEdit && entry ? new Date(entry.effectiveDate) : feed.updatedAt ? new Date(feed.updatedAt) : null;

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
        <Row justify="space-between">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: type.familyBold, fontSize: 18, color: t.ink }}>
              {isEdit ? tx('feedCollection.price.editTitle') : tx('feedCollection.price.addTitle')}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}
            >
              {feed.name}
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

      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        {/* recap tile — the values as they were before this edit/add */}
        <View
          style={{
            padding: 12,
            borderRadius: radii.md,
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderColor: t.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: palette.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={20} stroke={2} color="#fff" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Row gap={6}>
              <Text
                style={{
                  fontSize: 11.5,
                  color: t.inkSoft,
                  fontFamily: type.familySemi,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                }}
              >
                {isEdit
                  ? tx('feedCollection.price.oldPrice')
                  : tx('feedCollection.price.currentPrice')}
              </Text>
              {isCurrentEntry ? (
                <View
                  style={{
                    paddingVertical: 1,
                    paddingHorizontal: 6,
                    borderRadius: 9999,
                    backgroundColor: t.brandSoft,
                  }}
                >
                  <Text
                    style={{ fontSize: 9.5, fontFamily: type.familyBold, color: t.brandInk }}
                  >
                    {tx('feedCollection.price.currentPrice')}
                  </Text>
                </View>
              ) : null}
            </Row>
            <Row gap={6} style={{ alignItems: 'baseline', marginTop: 2 }}>
              {recapPrice != null ? (
                <>
                  <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>
                    {fmt.baht(recapPrice)}
                  </Text>
                  <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.family }}>
                    /{feed.unit}
                  </Text>
                  {recapDate ? (
                    <Text
                      style={{
                        fontSize: 11,
                        color: t.inkSoft,
                        fontFamily: type.family,
                        marginLeft: 4,
                      }}
                    >
                      · {thaiDate.short(recapDate)}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={{ fontSize: 13, color: t.inkSoft, fontFamily: type.family }}>
                  {tx('feedCollection.price.noHistory')}
                </Text>
              )}
            </Row>
          </View>
        </View>

        <Field
          label={
            hasPackSize
              ? tx('feedCollection.price.pricePerUnit', { unit: feed.unit })
              : tx('feedCollection.price.priceLabel')
          }
        >
          <FInput
            value={price}
            onChangeText={setPrice}
            suffix={`฿/${feed.unit}`}
            numeric
            hero
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </Field>

        {hasPackSize && derived?.pricePerKg != null ? (
          <Text
            style={{
              fontSize: 12,
              color: t.inkSoft,
              fontFamily: type.familySemi,
              marginTop: -8,
              marginBottom: 14,
            }}
          >
            = {fmt.bahtPrecise(derived.pricePerKg)}
            {tx('feedCollection.price.perKg')}
          </Text>
        ) : null}

        <Field
          label={tx('feedCollection.price.effectiveDate')}
          hint={tx('feedCollection.price.effectiveHint')}
        >
          <DateField
            ref={dateRef}
            value={effectiveDate}
            onChange={setEffectiveDate}
            warn={collision}
          />
        </Field>

        {collision ? (
          <CollisionWarning collidingDate={new Date(collidingEntry!.effectiveDate)} />
        ) : diff ? (
          <DiffHint delta={diff.delta} pct={diff.pct} isEdit={isEdit} />
        ) : null}

        {isEdit && onDelete ? (
          <Tappable
            onPress={onDelete}
            accessibilityRole="button"
            style={{
              marginTop: 18,
              height: 46,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon.trash size={16} color={t.danger} />
            <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 14 }}>
              {tx('feedCollection.price.deleteEntry')}
            </Text>
          </Tappable>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        {showOverwriteFooter ? (
          <Row gap={10}>
            <Tappable
              onPress={() => dateRef.current?.open()}
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
                {tx('feedCollection.price.pickAnotherDay')}
              </Text>
            </Tappable>
            <Tappable
              onPress={handleOverwrite}
              accessibilityRole="button"
              disabled={!priceValid || saving}
              style={{
                flex: 1.2,
                height: 52,
                borderRadius: radii.md,
                backgroundColor: t.danger,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !priceValid || saving ? 0.45 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
                {saving ? tx('common.saving') : tx('feedCollection.price.overwrite')}
              </Text>
            </Tappable>
          </Row>
        ) : (
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
              accessibilityRole="button"
              disabled={submitDisabled}
              style={{
                flex: 1.6,
                height: 52,
                borderRadius: radii.md,
                backgroundColor: t.brand,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: submitDisabled ? 0.45 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
                {saving
                  ? tx('common.saving')
                  : isEdit
                    ? tx('feedCollection.form.submitEdit')
                    : tx('feedCollection.price.submitNew')}
              </Text>
            </Tappable>
          </Row>
        )}
      </View>
    </SheetShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>{label}</Text>
          <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 13 }}>*</Text>
        </View>
        {hint ? (
          <Text style={{ fontSize: 11.5, color: t.inkMute, fontFamily: type.family }}>{hint}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CollisionWarning({ collidingDate }: { collidingDate: Date }) {
  const { t, mode } = useTheme();
  const { t: tx } = useTranslation();
  const ink = dangerInk(mode, t);
  return (
    <View
      style={{
        marginTop: 2,
        padding: 13,
        borderRadius: radii.md,
        backgroundColor: t.dangerSoft,
        borderWidth: 1,
        borderColor: t.danger,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <View style={{ marginTop: 1 }}>
        <Icon.warn size={16} color={t.danger} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontSize: 13, fontFamily: type.familyBold, color: ink }}>
          {tx('feedCollection.price.collision', { date: thaiDate.short(collidingDate) })}
        </Text>
        <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.family, lineHeight: 18 }}>
          {tx('feedCollection.price.collisionHelp')}
        </Text>
      </View>
    </View>
  );
}

/** Live delta vs the baseline entry — higher price is bad for the farmer
 *  (red), lower is good (green). */
function DiffHint({ delta, pct, isEdit }: { delta: number; pct: number; isEdit: boolean }) {
  const { t, mode } = useTheme();
  const { t: tx } = useTranslation();
  const up = delta > 0;
  const flatDelta = delta === 0;
  const fg = flatDelta ? t.inkSoft : up ? dangerInk(mode, t) : t.fillInk;
  const bg = flatDelta ? t.surfaceAlt : up ? t.dangerSoft : t.fillSoft;
  const TrendIcon = flatDelta ? Icon.flat : up ? Icon.trendUp : Icon.trendDown;
  return (
    <View
      style={{
        marginTop: 2,
        padding: 10,
        borderRadius: radii.sm,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <TrendIcon size={14} stroke={2} color={fg} />
      <Text style={{ color: fg, fontSize: 12, fontFamily: type.family }}>
        {isEdit ? tx('feedCollection.price.deltaEdit') : tx('feedCollection.price.deltaNew')}
      </Text>
      <Text style={{ color: fg, fontSize: 12, fontFamily: type.familyNumBold }}>
        {up ? '+' : delta < 0 ? '−' : ''}
        {fmt.bahtPrecise(Math.abs(delta))}
      </Text>
      <Text style={{ color: fg, fontSize: 12, fontFamily: type.familyNum }}>
        · {up ? '+' : delta < 0 ? '−' : ''}
        {Math.abs(pct).toFixed(1)}%
      </Text>
    </View>
  );
}
