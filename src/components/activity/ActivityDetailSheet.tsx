import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/icons';
import { Col, Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet/SheetShell';
import { Btn, Skeleton, Tappable } from '@/components/ui';
import {
  useActivitySellDetailsData,
  type ActivityRecordDetail,
  type SellDetailLine,
} from '@/features/activity';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import type { ThemePalette } from '@/theme/tokens';
import { fmt } from '@/utils/fmt';

/**
 * Read-only record sheet — what a กิจกรรมล่าสุด row opens.
 *
 * The row used to route into the fill/move/sell *creation* wizard, which meant
 * "show me what I saved" landed on a blank two-step form that could book a
 * second transaction. This is the read view instead: no inputs, no submit, and
 * a sheet rather than a pushed screen because the job is a three-second glance
 * that ends back on Home with the scroll position intact.
 *
 * Reading order, top to bottom: what kind of record and where → the one number
 * that defines it → the figures it was built from → for a sale, where that
 * number came from grade by grade → the pond(s) it touched → who saved it and
 * when. Distinct surfaces (tinted head / plain fact list / sunk breakdown /
 * bare footnote / the single filled button) keep those jobs from reading as one
 * undifferentiated stack of rows.
 *
 * Everything except the size breakdown comes from the feed payload already in
 * hand, so the sheet opens instantly; only a sale fetches, and only for the
 * per-grade lines the feed cannot carry.
 */

type Props = {
  detail: ActivityRecordDetail | null;
  onClose: () => void;
};

type Tone = { soft: string; ink: string };

function tonePair(kind: ActivityRecordDetail['kind'], t: ThemePalette): Tone {
  switch (kind) {
    case 'fill':
      return { soft: t.fillSoft, ink: t.fillInk };
    case 'move':
      return { soft: t.moveSoft, ink: t.moveInk };
    case 'sell':
      return { soft: t.sellSoft, ink: t.sellInk };
    case 'buy':
      return { soft: t.warnSoft, ink: t.statusMaint };
  }
}

const KIND_LABEL: Record<ActivityRecordDetail['kind'], string> = {
  fill: 'เติมปลา',
  move: 'ย้ายปลา',
  sell: 'ขายปลา',
  buy: 'ซื้อปลา',
};

const DATE_LABEL: Record<ActivityRecordDetail['kind'], string> = {
  fill: 'วันที่เติม',
  move: 'วันที่ย้าย',
  sell: 'วันที่ขาย',
  buy: 'วันที่ซื้อ',
};

function Glyph({ kind, color }: { kind: ActivityRecordDetail['kind']; color: string }) {
  if (kind === 'fill') return <Icon.plus size={20} color={color} stroke={2.2} />;
  if (kind === 'move') return <Icon.swap size={20} color={color} />;
  if (kind === 'sell') return <Icon.tag size={20} color={color} />;
  return <Icon.cycle size={20} color={color} />;
}

/** Average weight per fish is often well under 1 kg (fingerlings at 0.05 kg),
 *  where `fmt.kg`'s single decimal would round the figure away. */
function kgFine(n: number): string {
  const digits = n > 0 && n < 1 ? 2 : 1;
  return `${n.toLocaleString('en-US', { maximumFractionDigits: digits })} กก.`;
}

type Hero = {
  /** Every figure is named — a bare "฿1,050,000" leaves the reader guessing
   *  whether it is revenue, cost or an outstanding balance. */
  caption: string;
  value: string;
  /** Render in the action's own colour (revenue) instead of plain ink. */
  accent?: boolean;
  sub?: string;
};

/**
 * Headline figure: money for the cash events, head count for a move — a
 * transfer has no P&L of its own. Same rule as the per-pond ledger card, so
 * one record reads identically in both places.
 */
function heroFor(d: ActivityRecordDetail): Hero {
  const fishTail = d.fish ? ` · ${d.fish}` : '';
  switch (d.kind) {
    case 'sell':
      // Weight is what a sale is priced by, head count is what leaves the pond —
      // both belong next to the revenue rather than buried in the list.
      return {
        caption: 'รายรับรวม',
        value: fmt.baht(d.total),
        accent: true,
        sub:
          [
            d.totalWeightKg ? fmt.kg(d.totalWeightKg) : null,
            d.amount > 0 ? `${fmt.num(d.amount)} ตัว` : null,
          ]
            .filter(Boolean)
            .join(' · ') || undefined,
      };
    case 'move':
      return {
        caption: 'จำนวนที่ย้าย',
        value: `${fmt.num(d.amount)} ตัว`,
        sub: d.toPond ? `${d.pond} → ${d.toPond}` : d.fish || undefined,
      };
    case 'fill':
    case 'buy':
      return {
        caption: 'ต้นทุนรวม',
        value: fmt.baht(d.total),
        sub: `${fmt.num(d.amount)} ตัว${fishTail}`,
      };
  }
}

type Fact = { label: string; value: string; numeric?: boolean };

/**
 * The figures the headline was built from — only the ones this record actually
 * carries, and never a number the band above already shows (kg and head count
 * ride with the sell hero, so they don't repeat here).
 */
function factsFor(d: ActivityRecordDetail): Fact[] {
  const out: Fact[] = [{ label: DATE_LABEL[d.kind], value: d.eventDate }];

  if (d.kind === 'sell') {
    // The server derives a sale's ฿/kg from its detail lines — it is an average
    // across size grades, not one entered price, so the label says so.
    if (d.pricePerUnit > 0) {
      out.push({ label: 'ราคาเฉลี่ย', value: `${fmt.baht(d.pricePerUnit)} / กก.`, numeric: true });
    }
    out.push({ label: 'ผู้ซื้อ', value: d.merchant ?? 'ไม่ระบุผู้ซื้อ' });
    return out;
  }

  if (d.avgWeightKg > 0) {
    out.push({ label: 'น้ำหนักเฉลี่ย / ตัว', value: kgFine(d.avgWeightKg), numeric: true });
  }
  if (d.pricePerUnit > 0) {
    out.push({
      label: d.kind === 'move' ? 'ราคาโอน' : 'ราคา',
      value: `${fmt.baht(d.pricePerUnit)} / กก.`,
      numeric: true,
    });
  }

  // fill/move totals fold their additional costs in, so the extras are
  // recoverable by subtracting the base stock line — worth spelling out, since
  // a ฿240k fill whose ฿15k is transport reads very differently.
  const base = d.amount * d.avgWeightKg * d.pricePerUnit;
  const extras = d.total - base;
  if (base > 0 && extras >= 1) {
    out.push({ label: 'ค่าปลา', value: fmt.baht(base), numeric: true });
    out.push({ label: 'ค่าใช้จ่ายเพิ่มเติม', value: fmt.baht(extras), numeric: true });
  }
  if (d.kind === 'move' && d.total > 0) {
    out.push({ label: 'มูลค่าที่โอน', value: fmt.baht(d.total), numeric: true });
  }
  return out;
}

function FactRow({ fact, first }: { fact: Fact; first: boolean }) {
  const { t } = useTheme();
  return (
    <Row
      justify="space-between"
      align="flex-start"
      gap={space[4]}
      style={{
        paddingVertical: space[3] - 1,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: t.border,
      }}
    >
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          fontFamily: type.family,
          lineHeight: 20,
          flexShrink: 0,
        }}
      >
        {fact.label}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          flexShrink: 1,
          textAlign: 'right',
          fontSize: type.sizes.base,
          color: t.ink,
          // Latin numeric face for figures (tabular alignment down the column);
          // Thai face for prose values like the date or the buyer's name. Semi
          // is reserved for the figures, so a long date can't out-shout the
          // ฿/kg an operator is actually here to check.
          fontFamily: fact.numeric ? type.familyNumSemi : type.familyMedium,
          lineHeight: 22,
        }}
      >
        {fact.value}
      </Text>
    </Row>
  );
}

/**
 * Per-size revenue — the question the summed headline can't answer, since a
 * sale is priced per grade and a mixed load can hide a grade that sold badly
 * behind a healthy average.
 *
 * Laid out as grade + line total on the first line (the ฿ figure IS the
 * question, so it gets the weight and the right edge), with weight, ฿/kg and
 * head count as one muted run beneath. A four-column table would fit the same
 * data but push the ฿ figure into a cramped last column, and long grade names
 * would wrap it apart.
 *
 * Rendered on `surfaceSunk`, full-bleed and square: it reads as an inset band
 * of data rather than another rounded card competing with the ปิด button.
 */
function SellSizeBreakdown({ activityId }: { activityId: number }) {
  const { t } = useTheme();
  const { data, isLoading, isError } = useActivitySellDetailsData(activityId);

  // A sale always has at least one grade line (the API validates min=1), so an
  // empty non-loading result means the fetch found nothing to show — say so
  // rather than rendering a heading over blank space.
  if (!isLoading && !isError && data.length === 0) return null;

  return (
    <View
      style={{
        marginTop: space[3],
        paddingHorizontal: space[5],
        paddingTop: space[3],
        paddingBottom: space[2],
        backgroundColor: t.surfaceSunk,
      }}
    >
      <Text
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familySemi,
          color: t.inkMute,
          marginBottom: space[1],
        }}
      >
        แยกตามไซส์
      </Text>

      {isLoading ? (
        <View style={{ gap: space[3], paddingVertical: space[2] }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="55%" height={16} />
        </View>
      ) : isError ? (
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.family,
            color: t.inkMute,
            lineHeight: 20,
            paddingVertical: space[2],
          }}
        >
          โหลดรายละเอียดไซส์ไม่สำเร็จ · ปิดแล้วลองเปิดอีกครั้ง
        </Text>
      ) : (
        data.map((line, i) => (
          <SizeLineRow key={line.fishSizeGradeId} line={line} first={i === 0} />
        ))
      )}
    </View>
  );
}

function SizeLineRow({ line, first }: { line: SellDetailLine; first: boolean }) {
  const { t } = useTheme();
  // Head count is absent on lines written before the column was required —
  // omit it rather than printing a confident "0 ตัว".
  const support = [
    fmt.kg(line.weight),
    `${fmt.baht(line.pricePerUnit)} / กก.`,
    line.fishCount != null ? `${fmt.num(line.fishCount)} ตัว` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={{
        paddingVertical: space[2] + 2,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: t.border,
        gap: 1,
      }}
    >
      <Row justify="space-between" align="baseline" gap={space[3]}>
        <Text
          numberOfLines={1}
          style={{
            flexShrink: 1,
            fontSize: type.sizes.base,
            fontFamily: type.familySemi,
            color: t.ink,
            lineHeight: 22,
          }}
        >
          {line.sizeName || `ไซส์ #${line.fishSizeGradeId}`}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.md,
            fontFamily: type.familyNumBold,
            color: t.sellInk,
          }}
        >
          {fmt.baht(line.total)}
        </Text>
      </Row>
      <Text
        style={{
          fontSize: type.sizes.sm,
          fontFamily: type.familyNum,
          color: t.inkMute,
          lineHeight: 19,
        }}
      >
        {support}
      </Text>
    </View>
  );
}

/**
 * Continues the fact list's divider rhythm, but tappable — the one forward
 * move the sheet offers. Deliberately a link row and not a button: a record
 * view shouldn't look like it commits to anything.
 */
function PondLinkRow({
  label,
  suffix,
  tone,
  onPress,
}: {
  label: string;
  suffix?: string;
  tone: Tone;
  onPress: () => void;
}) {
  const { t } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      android_ripple={{ color: t.surfaceAlt }}
    >
      <Row
        justify="space-between"
        gap={space[3]}
        style={{
          minHeight: 48,
          paddingVertical: space[2],
          borderTopWidth: 1,
          borderTopColor: t.border,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flexShrink: 1,
            fontSize: type.sizes.base,
            fontFamily: type.familySemi,
            color: tone.ink,
            lineHeight: 22,
          }}
        >
          {label}
          {suffix ? (
            <Text style={{ fontFamily: type.family, fontSize: type.sizes.sm, color: t.inkMute }}>
              {`  ${suffix}`}
            </Text>
          ) : null}
        </Text>
        <Icon.chevR size={18} color={t.inkMute} />
      </Row>
    </Tappable>
  );
}

export function ActivityDetailSheet({ detail, onClose }: Props) {
  // No `showClose`: SheetShell's ✕ is absolutely positioned inside a 20pt-tall
  // grabber row but is 32pt tall, so the 20pt that overflows gets painted over
  // by whatever child comes next — here, the full-bleed head band. That left a
  // 12pt sliver of button, well under the 44pt floor. The sheet already has a
  // backdrop tap and a bottom ปิด, which is the better target one-handed
  // anyway, so the third affordance is no loss. Sheets that pass a `title` put
  // their ✕ in the title row and never hit this.
  return (
    <SheetShell visible={detail != null} onClose={onClose} fitContent>
      {/* Scrollable because the size breakdown makes the height unbounded: a
          sale spread across every grade can exceed SheetShell's 90%-of-screen
          cap, and without this the last grades plus the ปิด button would be
          clipped by the shell's overflow:hidden. `flexShrink` is what lets the
          ScrollView size below its content inside a max-height parent —
          otherwise it just renders at full content height and overflows. */}
      {detail ? (
        <ScrollView style={{ flexShrink: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
          <Body d={detail} onClose={onClose} />
        </ScrollView>
      ) : null}
    </SheetShell>
  );
}

/** Split out so every derived value is recomputed from a non-null record —
 *  and so the body remounts per record instead of holding the previous one. */
function Body({ d, onClose }: { d: ActivityRecordDetail; onClose: () => void }) {
  const { t } = useTheme();
  const router = useRouter();
  const tone = tonePair(d.kind, t);
  const hero = heroFor(d);
  const facts = factsFor(d);

  // Dismiss first: leaving the sheet stacked over the pushed screen would trap
  // the user behind a scrim they can only reach by backing out of the pond.
  const openPond = (pondId: number) => {
    onClose();
    router.push({ pathname: '/(app)/pond/[id]', params: { id: String(pondId) } });
  };

  return (
    <View accessibilityLabel={`รายละเอียด${KIND_LABEL[d.kind]} ${d.pond}`}>
      {/* ── Head band: what this is, then the one figure that defines it ── */}
      <View
        style={{
          backgroundColor: tone.soft,
          paddingHorizontal: space[5],
          paddingTop: space[4],
          paddingBottom: space[5],
          gap: space[4],
        }}
      >
        <Row gap={space[3]} align="center">
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              backgroundColor: t.surface,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Glyph kind={d.kind} color={tone.ink} />
          </View>
          <Col gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: tone.ink }}>
              {KIND_LABEL[d.kind]}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: type.sizes.sm, fontFamily: type.family, color: t.inkSoft }}
            >
              {`${d.pond} · ${d.farm}`}
            </Text>
          </Col>
        </Row>

        <Col gap={2}>
          <Text style={{ fontSize: type.sizes.xs, fontFamily: type.familySemi, color: t.inkSoft }}>
            {hero.caption}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontSize: type.sizes.hero,
              fontFamily: type.familyNumBold,
              color: hero.accent ? tone.ink : t.ink,
              letterSpacing: -0.8,
            }}
          >
            {hero.value}
          </Text>
          {hero.sub ? (
            <Text
              style={{
                fontSize: type.sizes.base,
                fontFamily: type.familyNum,
                color: t.inkSoft,
                lineHeight: 22,
              }}
            >
              {hero.sub}
            </Text>
          ) : null}
        </Col>
      </View>

      {/* ── Fact list: the figures behind the headline ─────────────────── */}
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1] }}>
        {facts.map((f, i) => (
          <FactRow key={f.label} fact={f} first={i === 0} />
        ))}
      </View>

      {/* ── Where the headline came from, grade by grade (sells only) ───── */}
      {d.kind === 'sell' ? <SellSizeBreakdown activityId={d.id} /> : null}

      {/* ── Forward links: the pond(s) this record touched ─────────────── */}
      <View style={{ paddingHorizontal: space[5] }}>
        <PondLinkRow label={`ดู${d.pond}`} tone={tone} onPress={() => openPond(d.pondId)} />
        {/* A move concerns two ponds, so both are reachable — the destination
            is labelled, since "ดูบ่อ 5 กลาง" alone reads like a second source. */}
        {d.toPondId != null && d.toPond ? (
          <PondLinkRow
            label={`ดู${d.toPond}`}
            suffix="ปลายทาง"
            tone={tone}
            onPress={() => openPond(d.toPondId as number)}
          />
        ) : null}
      </View>

      {/* ── Audit footnote: who saved this, and when they actually saved it.
          Set on the sheet's own background with no fill and no radius: as a
          tinted rounded card it was indistinguishable from the ปิด button
          directly below it, so inert text read as tappable and the real
          control read as inert. Whitespace separates it instead — that leaves
          the button as the only filled slab down here, which is the whole
          signal. ─────────────────────────────────────────────────────────── */}
      <View style={{ marginTop: space[4], paddingHorizontal: space[5], gap: space[2] }}>
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.family,
            color: t.inkMute,
            lineHeight: 20,
          }}
        >
          {/* The event date is already a fact above. Repeating it here only
              carries information when the two differ — otherwise the same day
              appeared twice in two formats within a screen's height. */}
          {d.backdated
            ? `บันทึกเมื่อ ${d.savedDateLabel} · ${d.savedTimeLabel} · โดย${d.by}`
            : `บันทึก ${d.savedTimeLabel} · โดย${d.by}`}
        </Text>
        {/* Only flagged when it matters: the event date and the save date are
            different days, so the clock time above is not when it happened. */}
        {d.backdated ? (
          <Row gap={space[2] - 2} align="center">
            <View
              style={{
                paddingHorizontal: space[2],
                paddingVertical: 2,
                borderRadius: radii.xs,
                backgroundColor: t.warnSoft,
              }}
            >
              <Text
                style={{
                  fontSize: type.sizes.xs,
                  fontFamily: type.familyBold,
                  color: t.statusMaint,
                  lineHeight: 16,
                }}
              >
                บันทึกย้อนหลัง
              </Text>
            </View>
            <Text style={{ fontSize: type.sizes.xs, fontFamily: type.family, color: t.inkMute }}>
              ไม่ใช่วันเดียวกับวันที่เกิดรายการ
            </Text>
          </Row>
        ) : null}
      </View>

      {/* The sheet's only dismiss control, and the right one for a gloves-in-
          the-sun app: the bottom edge is thumb-reachable, a top-right ✕ isn't. */}
      <View style={{ paddingHorizontal: space[4], paddingTop: space[4] }}>
        <Btn variant="soft" tone="neutral" block onPress={onClose}>
          ปิด
        </Btn>
      </View>
    </View>
  );
}
