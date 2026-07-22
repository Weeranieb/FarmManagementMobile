import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { TH_MONTH_NAMES_SHORT, thaiDate } from '@/locale/thaiDate';
import { feedPaletteFor, type FeedPalette } from '@/screens/feed-collection/feedPalette';
import { FeedChartIcon } from '@/screens/feed-collection/components/FeedIcons';
import type { FeedKind, FeedPriceHistoryEntry } from '@/features/feed-collection';
import { makeXLabelMonths, makeYTicks, smoothPath, type Pt } from '../historyUtils';

// Chart canvas dimensions match the design 1:1; viewBox is responsive via
// `preserveAspectRatio` so the card scales to the phone width without distorting
// the line.
const CHART_W = 326;
const CHART_H = 230;
const PAD = { l: 38, r: 14, t: 22, b: 32 };

type Props = {
  data: FeedPriceHistoryEntry[];
  kind: FeedKind;
  /** No history at all — full "start logging" empty state. */
  isEmpty: boolean;
  /** Exactly one entry — chart needs two points, but the row below stays editable. */
  isSingle: boolean;
  isAdmin: boolean;
  onLogPrice: () => void;
};

export function PriceChartCard({ data, kind, isEmpty, isSingle, isAdmin, onLogPrice }: Props) {
  const { t } = useTheme();
  const [tip, setTip] = useState<number | null>(null);
  const [canvasW, setCanvasW] = useState(CHART_W);
  const palette = feedPaletteFor(kind);

  if (isSingle) {
    return <SingleEntryChartCard palette={palette} isAdmin={isAdmin} onAdd={onLogPrice} />;
  }
  if (isEmpty || data.length === 0) {
    return <EmptyChartCard palette={palette} isAdmin={isAdmin} onLogPrice={onLogPrice} />;
  }

  return (
    <Card padded={false}>
      <View style={{ padding: 14, paddingBottom: 8 }}>
        <View
          style={{
            paddingHorizontal: 6,
            paddingBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>
            ราคาตามเวลา
          </Text>
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>
            {data.length} จุด
          </Text>
        </View>

        <View
          onLayout={(e: LayoutChangeEvent) => setCanvasW(e.nativeEvent.layout.width)}
          style={{ width: '100%' }}
        >
          <ChartCanvas
            data={data}
            tip={tip}
            onTip={setTip}
            canvasW={canvasW}
            palette={palette}
          />
        </View>
      </View>
    </Card>
  );
}

/** One entry in the system — the chart can't draw yet, but the timeline row
 *  below remains editable. Copy + layout from design ⑬ "price-single". */
function SingleEntryChartCard({
  palette,
  isAdmin,
  onAdd,
}: {
  palette: FeedPalette;
  isAdmin: boolean;
  onAdd: () => void;
}) {
  const { t } = useTheme();
  return (
    <Card padded={false}>
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 34,
          paddingBottom: 26,
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            backgroundColor: palette.soft,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: hexAlpha(palette.ink, 0.18),
          }}
        >
          <FeedChartIcon size={30} stroke={1.5} color={palette.ink} />
        </View>
        <View style={{ alignItems: 'center', gap: 4, maxWidth: 250 }}>
          <Text
            style={{ fontSize: 15, fontFamily: type.familyBold, color: t.ink, textAlign: 'center' }}
          >
            มีราคาเดียวในระบบ
          </Text>
          <Text
            style={{
              fontSize: 12.5,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 19,
              textAlign: 'center',
            }}
          >
            กราฟจะปรากฏเมื่อมีอย่างน้อยสองรายการ — รายการเดียวนี้ยังแก้ไขได้ที่ด้านล่าง
          </Text>
        </View>
        {isAdmin ? (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            style={{
              marginTop: 4,
              height: 44,
              paddingHorizontal: 20,
              borderRadius: 12,
              backgroundColor: t.brand,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon.plus size={18} stroke={2.2} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 14 }}>
              เพิ่มราคา
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

function EmptyChartCard({
  palette,
  isAdmin,
  onLogPrice,
}: {
  palette: FeedPalette;
  isAdmin: boolean;
  onLogPrice: () => void;
}) {
  const { t } = useTheme();
  return (
    <Card padded={false}>
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 40,
          paddingBottom: 28,
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: palette.soft,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: hexAlpha(palette.ink, 0.18),
          }}
        >
          <FeedChartIcon size={34} stroke={1.5} color={palette.ink} />
        </View>
        <View style={{ alignItems: 'center', gap: 4, maxWidth: 280 }}>
          <Text
            style={{ fontSize: 16, fontFamily: type.familyBold, color: t.ink, textAlign: 'center' }}
          >
            ยังไม่มีประวัติราคา
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 20,
              textAlign: 'center',
            }}
          >
            บันทึกราคาใหม่เพื่อเริ่มเก็บประวัติ — ค่าเฉลี่ย ค่าสูงสุด/ต่ำสุด จะคำนวณให้อัตโนมัติ
          </Text>
        </View>
        {isAdmin ? (
          <Pressable
            onPress={onLogPrice}
            accessibilityRole="button"
            style={{
              marginTop: 6,
              height: 46,
              paddingHorizontal: 22,
              borderRadius: 12,
              backgroundColor: t.brand,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon.plus size={18} stroke={2.2} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 14 }}>
              บันทึกราคาใหม่
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

type ChartCanvasProps = {
  data: FeedPriceHistoryEntry[];
  tip: number | null;
  onTip: (i: number | null) => void;
  canvasW: number;
  palette: FeedPalette;
};

function ChartCanvas({ data, tip, onTip, canvasW, palette }: ChartCanvasProps) {
  const { t } = useTheme();

  const geometry = useMemo(() => buildChartGeometry(data), [data]);
  const { pts, ticks, xLabels, recentIdx, minIdx, maxIdx, areaD, pathD, yMin, yMax } = geometry;

  const highlightIdx = new Set([recentIdx, minIdx, maxIdx]);
  const renderedHeight = canvasW > 0 ? (canvasW * CHART_H) / CHART_W : CHART_H;

  return (
    <View style={{ position: 'relative' }}>
      <Svg
        width="100%"
        height={renderedHeight}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* gridlines + y labels */}
        {ticks.map((tk, i) => {
          const y = yOfTick(tk, yMin, yMax);
          return (
            <G key={`tick-${i}`}>
              <Line
                x1={PAD.l}
                x2={CHART_W - PAD.r}
                y1={y}
                y2={y}
                stroke={t.border}
                strokeWidth={1}
                strokeDasharray={i === 0 ? undefined : '3,4'}
              />
              {/* Bare number — no ฿ prefix. familyNum (IBM Plex Sans, Latin)
                  has no Thai Baht glyph, and react-native-svg draws the
                  fallback ฿ with zero advance, landing it on top of a digit.
                  The currency is already clear from the hero card + stat tiles. */}
              <SvgText
                x={PAD.l - 8}
                y={y + 4}
                fontSize="10"
                fontFamily={type.familyNum}
                fill={t.inkMute}
                textAnchor="end"
              >
                {tk}
              </SvgText>
            </G>
          );
        })}

        {/* x labels */}
        {xLabels.map((lab, i) => (
          <SvgText
            key={`xlab-${i}`}
            x={lab.x}
            y={CHART_H - PAD.b + 18}
            fontSize="10"
            fontFamily={type.family}
            fill={t.inkMute}
            textAnchor="middle"
          >
            {lab.text}
          </SvgText>
        ))}

        {/* area fill + line (only when 2+ points) */}
        {pts.length > 1 ? (
          <>
            <Path d={areaD} fill={palette.tile} opacity={0.10} />
            <Path
              d={pathD}
              fill="none"
              stroke={palette.tileEdge}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}

        {/* No on-chart value labels: the min/max/recent prices already appear in
            the StatsRow tiles and the timeline below, and an edge point (e.g. a
            2-point series where the max sits at the left edge) would render its
            label straight over the Y-axis ticks. Highlight dots mark the points;
            tapping shows the exact value in the tooltip. */}

        {/* highlight dots: most-recent has a filled core, min/max are outlined */}
        {pts.map((p, i) => {
          const isHi = highlightIdx.has(i);
          if (!isHi && tip !== i) return null;
          return (
            <G key={`dot-${i}`}>
              {isHi ? (
                <>
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="#fff"
                    stroke={palette.tileEdge}
                    strokeWidth={2.2}
                  />
                  {i === recentIdx ? (
                    <Circle cx={p.x} cy={p.y} r={3.2} fill={palette.tileEdge} />
                  ) : null}
                </>
              ) : null}
              {tip === i ? (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={palette.tileEdge}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ) : null}
            </G>
          );
        })}

        {/* tooltip bubble */}
        {tip != null && pts[tip] && data[tip] ? (
          <Tooltip
            x={pts[tip]!.x}
            y={pts[tip]!.y}
            chartW={CHART_W}
            inkFill={t.ink}
            surface={t.surface}
            dateLabel={thaiDate.short(new Date(data[tip]!.effectiveDate))}
            priceLabel={`฿${data[tip]!.price}`}
          />
        ) : null}
      </Svg>

      {/* Tap layer for the chart — converts touch coords back into a data index.
          Sits on top of the SVG so we don't have to deal with per-circle hit
          targets on RN (which doesn't fire onPress on Svg children reliably). */}
      <TapLayer
        canvasW={canvasW}
        data={data}
        onPick={(i) => onTip(tip === i ? null : i)}
        height={renderedHeight}
      />
    </View>
  );
}

function Tooltip({
  x,
  y,
  chartW,
  inkFill,
  surface,
  dateLabel,
  priceLabel,
}: {
  x: number;
  y: number;
  chartW: number;
  inkFill: string;
  surface: string;
  dateLabel: string;
  priceLabel: string;
}) {
  const W = 124;
  const H = 44;
  let cx = x - W / 2;
  let cy = y - H - 14;
  if (cx < 4) cx = 4;
  if (cx + W > chartW - 4) cx = chartW - 4 - W;
  const flipped = cy < 4;
  if (flipped) cy = y + 14;

  return (
    <G pointerEvents="none">
      <Rect x={cx} y={cy} width={W} height={H} rx={10} fill={inkFill} opacity={0.96} />
      {flipped ? (
        <Path
          d={`M ${x - 5} ${cy} L ${x} ${cy - 6} L ${x + 5} ${cy} Z`}
          fill={inkFill}
          opacity={0.96}
        />
      ) : (
        <Path
          d={`M ${x - 5} ${cy + H} L ${x} ${cy + H + 6} L ${x + 5} ${cy + H} Z`}
          fill={inkFill}
          opacity={0.96}
        />
      )}
      <SvgText
        x={cx + 12}
        y={cy + 18}
        fontSize="11"
        fontFamily={type.family}
        fill={surface}
        opacity={0.75}
      >
        {dateLabel}
      </SvgText>
      {/* Thai bold font (has the ฿ glyph) — familyNumBold is Latin-only and
          renders ฿ with broken metrics inside SvgText. */}
      <SvgText
        x={cx + 12}
        y={cy + 34}
        fontSize="14"
        fontFamily={type.familyBold}
        fill={surface}
      >
        {priceLabel}
      </SvgText>
    </G>
  );
}

function TapLayer({
  canvasW,
  data,
  onPick,
  height,
}: {
  canvasW: number;
  data: FeedPriceHistoryEntry[];
  onPick: (i: number) => void;
  height: number;
}) {
  if (data.length === 0) return null;
  const first = data[0]!;
  const last = data[data.length - 1]!;

  const scale = canvasW / CHART_W;
  const tMin = new Date(first.effectiveDate).getTime();
  const tMax = new Date(last.effectiveDate).getTime();
  const tSpan = tMax - tMin || 1;
  const innerW = CHART_W - PAD.l - PAD.r;

  // Per-point hit areas, each ~16pt wide (matches the design's hit radius).
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height }}>
      {data.map((d, i) => {
        const localX =
          data.length === 1
            ? PAD.l + innerW / 2
            : PAD.l + ((new Date(d.effectiveDate).getTime() - tMin) / tSpan) * innerW;
        const left = localX * scale - 16;
        return (
          <Pressable
            key={`hit-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`จุดที่ ${i + 1}`}
            onPress={() => onPick(i)}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left,
              width: 32,
            }}
          />
        );
      })}
    </View>
  );
}

// ── Geometry helpers (kept inside the component file because they're a single-
// use packaging of the more general math in historyUtils.ts) ────────────────

type ChartGeometry = {
  pts: Pt[];
  ticks: number[];
  xLabels: { x: number; text: string }[];
  recentIdx: number;
  minIdx: number;
  maxIdx: number;
  pathD: string;
  areaD: string;
  yMin: number;
  yMax: number;
};

function buildChartGeometry(data: FeedPriceHistoryEntry[]): ChartGeometry {
  // Caller guarantees `data.length >= 1` (the chart-card empty-state branch
  // catches the zero case before we ever get here).
  const first = data[0]!;
  const last = data[data.length - 1]!;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pad = Math.max(1, (maxPrice - minPrice) * 0.18);
  const yMin = Math.floor(minPrice - pad);
  const yMax = Math.ceil(maxPrice + pad);

  const tMin = new Date(first.effectiveDate).getTime();
  const tMax = new Date(last.effectiveDate).getTime();
  const tSpan = tMax - tMin || 1;

  const innerW = CHART_W - PAD.l - PAD.r;
  const innerH = CHART_H - PAD.t - PAD.b;

  const xOf = (iso: string) =>
    PAD.l + ((new Date(iso).getTime() - tMin) / tSpan) * innerW;
  const yOfPrice = (p: number) => PAD.t + (1 - (p - yMin) / (yMax - yMin)) * innerH;

  const pts: Pt[] =
    data.length === 1
      ? [{ x: PAD.l + innerW / 2, y: PAD.t + innerH / 2 }]
      : data.map((d) => ({ x: xOf(d.effectiveDate), y: yOfPrice(d.price) }));

  const pathD = smoothPath(pts);
  const ptFirst = pts[0]!;
  const ptLast = pts[pts.length - 1]!;
  const areaD =
    pts.length > 1
      ? `${pathD} L ${ptLast.x},${PAD.t + innerH} L ${ptFirst.x},${PAD.t + innerH} Z`
      : '';

  const ticks = makeYTicks(yMin, yMax, 4);
  const xLabels = makeXLabelMonths(data).map((m) => ({
    x: PAD.l + ((m.tMs - tMin) / tSpan) * innerW,
    text: TH_MONTH_NAMES_SHORT[m.monthIdx] ?? '',
  }));

  const recentIdx = pts.length - 1;
  const minIdx = prices.indexOf(minPrice);
  const maxIdx = prices.indexOf(maxPrice);

  return { pts, ticks, xLabels, recentIdx, minIdx, maxIdx, pathD, areaD, yMin, yMax };
}

function yOfTick(tickValue: number, yMin: number, yMax: number): number {
  if (yMax === yMin) return PAD.t + (CHART_H - PAD.t - PAD.b) / 2;
  return PAD.t + (1 - (tickValue - yMin) / (yMax - yMin)) * (CHART_H - PAD.t - PAD.b);
}

function hexAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
