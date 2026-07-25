import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH, displayPondName } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { usePondActivitiesData, type PondActivityModel } from '@/features/pond';

export function HistoryBody({ pondId }: { pondId: number }) {
  const { data: list, isLoading } = usePondActivitiesData(pondId);

  if (isLoading && list.length === 0) {
    return (
      <View style={{ padding: 32, alignItems: 'center' }}>
        <LoadingState />
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View style={{ padding: 32, alignItems: 'center' }}>
        <EmptyState />
      </View>
    );
  }
  return (
    <View
      style={{
        paddingHorizontal: space[5],
        paddingTop: space[4],
        gap: space[3],
        paddingBottom: space[5],
      }}
    >
      {list.map((a) => (
        <ActivityHistoryCard key={a.id} a={a} />
      ))}
    </View>
  );
}

function LoadingState() {
  const { t } = useTheme();
  return (
    <Text style={{ color: t.inkMute, fontFamily: type.family, fontSize: type.sizes.sm }}>
      กำลังโหลดประวัติกิจกรรม…
    </Text>
  );
}

function EmptyState() {
  const { t } = useTheme();
  return (
    <Col gap={space[2] - 2} align="center">
      <Icon.doc size={28} color={t.inkMute} />
      <Text style={{ color: t.inkSoft, fontFamily: type.family, fontSize: type.sizes.sm }}>
        ยังไม่มีประวัติกิจกรรมในบ่อนี้
      </Text>
    </Col>
  );
}

type Metric = { label: string; value: string };

/**
 * Supporting figures, each still named — a bare "5,000 กก." leaves the reader
 * guessing whether it's the sold weight or an average. Labels ride above the
 * value in a lean strip (11pt label, no divider, no extra padding) so naming
 * them costs ~13pt of height, not a whole second block.
 *
 * A sell activity carries none of these on the activity row itself: head count,
 * weight and average ฿/kg are summed from its sell_details by the API, and
 * without them a ฿1M sale would render as nothing but the buyer's name.
 *
 * `showCount` is off when the headline already IS the head count (a move), so
 * the same number never appears twice in one card.
 */
function metricsFor(a: PondActivityModel, showCount: boolean): Metric[] {
  const out: Metric[] = [];
  if (showCount && a.amount > 0) out.push({ label: 'จำนวน', value: `${fmt.num(a.amount)} ตัว` });
  if (a.mode === 'sell' && a.totalWeightKg) {
    out.push({ label: 'น้ำหนักรวม', value: fmt.kg(a.totalWeightKg) });
  }
  if (a.pricePerUnit) {
    out.push({
      label: a.mode === 'sell' ? 'เฉลี่ย/กก.' : 'ราคา/กก.',
      value: fmt.baht(a.pricePerUnit),
    });
  }
  return out;
}

function ActivityHistoryCard({ a }: { a: PondActivityModel }) {
  const { t } = useTheme();
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft, border: t.fill },
    move: { fg: t.moveInk, bg: t.moveSoft, border: t.move },
    sell: { fg: t.sellInk, bg: t.sellSoft, border: t.sell },
  } as const;
  const { fg, bg, border } = accentMap[a.mode];

  const isIncomingMove = a.mode === 'move' && a.direction === 'in';
  const label =
    a.mode === 'move' ? (isIncomingMove ? 'ย้ายเข้า' : 'ย้ายออก') : a.mode === 'fill' ? 'เติมปลา' : 'ขายปลา';
  const fishLabel = FISH_TH[a.fishType] ?? a.fishType;

  // Headline value: money for fill/sell, head count for a move (a transfer has
  // no P&L of its own from the pond's side).
  const hasMoney = a.total > 0 && a.mode !== 'move';
  const headline = hasMoney
    ? `${a.mode === 'sell' ? '+' : ''}${fmt.baht(a.total)}`
    : a.amount > 0
      ? `${isIncomingMove ? '+' : '−'}${fmt.num(a.amount)} ตัว`
      : '';

  // Line 1 tail — the date plus who/what this was with, one muted run.
  const counterparty =
    a.mode === 'sell'
      ? (a.merchant ?? 'ไม่ระบุผู้ซื้อ')
      : isIncomingMove
        ? a.fromPondName
          ? `จาก ${displayPondName(a.fromPondName)}`
          : null
        : a.toPondName
          ? `ไป ${displayPondName(a.toPondName)}`
          : null;
  const context = [thaiDate.short(new Date(a.date)), fishLabel || null, counterparty]
    .filter(Boolean)
    .join(' · ');

  const metrics = metricsFor(a, hasMoney);
  // A sell reports gross revenue, so its extra costs are still outstanding —
  // spell out the net. Fill/move already have theirs folded into the total.
  const net = a.mode === 'sell' && a.additionalCost ? a.total - a.additionalCost : null;

  return (
    <Card padded={false} style={{ overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: border }}>
      <View
        style={{
          paddingVertical: space[3],
          paddingHorizontal: space[4] - 2,
          gap: space[2] - 2,
        }}
      >
        <Row justify="space-between" align="center" gap={space[2]}>
          <Row gap={space[2] - 2} style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                paddingHorizontal: space[2],
                paddingVertical: 3,
                borderRadius: radii.xs,
                backgroundColor: bg,
              }}
            >
              <Text
                style={{
                  color: fg,
                  fontFamily: type.familyBold,
                  fontSize: type.sizes.xs,
                  lineHeight: 16,
                }}
              >
                {label}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                color: t.inkMute,
                fontFamily: type.family,
                fontSize: type.sizes.sm,
                lineHeight: 20,
              }}
            >
              {context}
            </Text>
          </Row>
          {headline ? (
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: type.sizes.md,
                color: a.mode === 'sell' ? t.sellInk : t.ink,
              }}
            >
              {headline}
            </Text>
          ) : null}
        </Row>

        {/* Named figures in a lean strip — no divider, no extra padding, and
            the label sits directly on its value. Cells only share the width
            when there are several; a lone figure (a move carries just its
            transfer price) hugs the left instead of holding a third of a grid. */}
        {metrics.length > 0 ? (
          <Row gap={space[3]} align="flex-start" style={{ marginTop: 2 }}>
            {metrics.map((m) => (
              <Col key={m.label} style={{ flex: metrics.length > 1 ? 1 : 0, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: type.sizes.xs,
                    color: t.inkMute,
                    fontFamily: type.family,
                    lineHeight: 16,
                  }}
                >
                  {m.label}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: type.sizes.base,
                    color: t.ink,
                    fontFamily: type.familyNumSemi,
                    lineHeight: 21,
                  }}
                >
                  {m.value}
                </Text>
              </Col>
            ))}
          </Row>
        ) : null}

        {a.additionalCost ? (
          <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}>
            {/* Only a sale still owes these, so only a sale nets them off —
                fill/move already have them inside the headline total. */}
            {net != null ? (
              <>
                หักค่าใช้จ่าย {fmt.baht(a.additionalCost)} → สุทธิ{' '}
                <Text
                  style={{
                    color: net < 0 ? t.danger : fg,
                    fontFamily: type.familyNumBold,
                  }}
                >
                  {/* Sign outside the currency mark: "−฿3,400", not "฿-3,400". */}
                  {net < 0 ? `−${fmt.baht(-net)}` : fmt.baht(net)}
                </Text>
              </>
            ) : (
              `รวมค่าใช้จ่ายเพิ่มเติม ${fmt.baht(a.additionalCost)}`
            )}
          </Text>
        ) : null}

        {a.remark ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 20,
            }}
          >
            {a.remark}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
