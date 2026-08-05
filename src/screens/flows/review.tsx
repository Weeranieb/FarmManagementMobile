// Shared review-screen primitives — section, row, grand-total block, impact
// cell, warning banner. Used by Fill / Sell / Move step-2 review screens
// (§⑤ Web-parity · Confirmation in FAB Picker Fix.html).

import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type, type ThemePalette } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import type { CostRow } from './additional-costs';

type Tone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<
  Tone,
  { solid: keyof ThemePalette; ink: keyof ThemePalette; soft: keyof ThemePalette }
> = {
  fill: { solid: 'fill', ink: 'fillInk', soft: 'fillSoft' },
  sell: { solid: 'sell', ink: 'sellInk', soft: 'sellSoft' },
  move: { solid: 'move', ink: 'moveInk', soft: 'moveSoft' },
};

export function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: type.familyBold,
          color: t.inkSoft,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Card padded={false}>
        <View style={{ paddingHorizontal: 16 }}>{children}</View>
      </Card>
    </View>
  );
}

export function ReviewRow({
  l,
  v,
  big,
  last,
}: {
  l: string;
  v: string;
  big?: boolean;
  last?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: t.inkSoft,
          fontFamily: big ? type.familyBold : type.family,
          flexShrink: 1,
          paddingRight: 12,
        }}
      >
        {l}
      </Text>
      <Text
        style={{
          fontFamily: big ? type.familyNumBold : type.familyNumSemi,
          fontSize: big ? 18 : 14,
          color: t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

/** Empty placeholder used inside an additional-costs section with zero rows. */
export function ReviewEmpty({ label }: { label?: string }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ paddingVertical: 14 }}>
      <Text
        style={{
          fontSize: 13,
          color: t.inkMute,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        {label ?? tx('flows.none')}
      </Text>
    </View>
  );
}

/** Tone-colored stat cell used inside the stock-impact rows. */
export function ImpactCell({
  label,
  v,
  accent,
}: {
  label: string;
  v: string;
  accent?: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.md,
      }}
    >
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 18,
          color: accent ?? t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

/** Big tone-colored grand-total block — thick border + emphasized number. */
export function GrandTotalBlock({
  tone,
  label,
  value,
}: {
  tone: Tone;
  label: string;
  value: string;
}) {
  const { t } = useTheme();
  const k = TONE_KEYS[tone];
  return (
    <View
      style={{
        marginTop: 18,
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: t[k.soft],
        borderWidth: 2,
        borderColor: t[k.solid],
        borderRadius: radii.lg,
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: type.familyBold,
          color: t[k.ink],
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 28,
          color: t[k.ink],
          letterSpacing: -0.5,
          // Pin the line box: Android's font padding for familyNum is
          // asymmetric, so large numerals drift without an explicit lineHeight.
          lineHeight: 32,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/** "⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้" sticker pinned above the confirm row. */
export function WarningBanner({
  msg,
}: {
  msg?: string;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const warning = msg ?? tx('flows.irreversible');
  return (
    <View
      style={{
        marginTop: 18,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: t.warnSoft,
        borderWidth: 1,
        borderColor: t.statusMaint + '40',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <Icon.warn size={18} color={t.statusMaint} stroke={2} />
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          fontFamily: type.familySemi,
          color: t.statusMaint,
          lineHeight: 19,
        }}
      >
        {warning}
      </Text>
    </View>
  );
}

/** Inline "บ่อจะถูกปิดหลัง..." chip used inside stock-impact sections. */
export function ClosePondBadge({ msg }: { msg: string }) {
  const { t } = useTheme();
  return (
    <Row
      gap={6}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: t.warnSoft,
        borderRadius: radii.sm,
      }}
    >
      <Icon.cycle size={14} color={t.statusMaint} />
      <Text
        style={{
          fontSize: 12,
          color: t.statusMaint,
          fontFamily: type.familySemi,
          flexShrink: 1,
        }}
      >
        {msg}
      </Text>
    </Row>
  );
}

/** Renders the itemized list inside the ค่าใช้จ่ายเพิ่มเติม section. */
export function AdditionalCostsList({
  rows,
  signed = '+',
}: {
  rows: CostRow[];
  /** '+' (default) shows raw value; '-' prepends '-' to each amount (sell screen). */
  signed?: '+' | '-';
}) {
  const { t: tx } = useTranslation();
  const filtered = rows.filter((r) => r.category.trim() || parseFloat(r.amount) > 0);
  if (filtered.length === 0) return <ReviewEmpty />;
  const total = filtered.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const fmtAmount = (n: number) => (signed === '-' ? `-${fmt.baht(n)}` : fmt.baht(n));
  return (
    <>
      {filtered.map((c, i) => (
        <ReviewRow
          key={i}
          l={c.category || '—'}
          v={fmtAmount(parseFloat(c.amount) || 0)}
          last={i === filtered.length - 1}
        />
      ))}
      <SubtotalRow label={tx('flows.extraCostsTotal')} value={fmtAmount(total)} />
    </>
  );
}

/** Visually heavier than ReviewRow — used for "รวม" summary rows that should
 *  read as a sub-total rather than another item. */
function SubtotalRow({ label, value }: { label: string; value: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: -16, // bleed to the Card edge
        marginTop: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: t.surfaceAlt,
        borderTopWidth: 1,
        borderTopColor: t.borderStrong,
        // Match the Card's outer borderRadius (radii.lg = 18) so the tinted
        // strip doesn't square off the bottom corners.
        borderBottomLeftRadius: radii.lg,
        borderBottomRightRadius: radii.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.familyBold,
          color: t.ink,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 15,
          color: t.ink,
          letterSpacing: -0.2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
