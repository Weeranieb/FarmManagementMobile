import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH } from '@/utils/fmt';
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
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12, paddingBottom: 20 }}>
      {list.map((a) => (
        <ActivityHistoryCard key={a.id} a={a} />
      ))}
    </View>
  );
}

function LoadingState() {
  const { t } = useTheme();
  return (
    <Text style={{ color: t.inkMute, fontFamily: type.family, fontSize: 13 }}>
      กำลังโหลดประวัติกิจกรรม…
    </Text>
  );
}

function EmptyState() {
  const { t } = useTheme();
  return (
    <Col gap={6} align="center">
      <Icon.doc size={28} color={t.inkMute} />
      <Text style={{ color: t.inkSoft, fontFamily: type.family, fontSize: 13 }}>
        ยังไม่มีประวัติกิจกรรมในบ่อนี้
      </Text>
    </Col>
  );
}

function ActivityHistoryCard({ a }: { a: PondActivityModel }) {
  const { t } = useTheme();
  const labelMap = {
    fill: 'เติมปลา',
    move: 'ย้ายปลา',
    sell: 'ขายปลา',
  } as const;
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft, border: t.fill },
    move: { fg: t.moveInk, bg: t.moveSoft, border: t.move },
    sell: { fg: t.sellInk, bg: t.sellSoft, border: t.sell },
  } as const;
  const { fg, bg, border } = accentMap[a.mode];
  const hasMoney = a.total > 0 && (a.mode === 'sell' || a.mode === 'fill');
  const hasCount = a.amount > 0;
  const amountRight = hasMoney
    ? a.mode === 'sell'
      ? `+${fmt.baht(a.total)}`
      : fmt.baht(a.total)
    : hasCount
      ? `${fmt.num(a.amount)} ตัว`
      : '';
  const fishLabel = FISH_TH[a.fishType] ?? a.fishType;
  const leadLabel = a.mode === 'sell' ? (a.merchant ?? '—') : fishLabel;
  const detailLine = [leadLabel, hasCount ? `${fmt.num(a.amount)} ตัว` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      padded={false}
      style={{ overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: border }}
    >
      <View style={{ padding: 16, gap: 10, backgroundColor: bg + '18' }}>
        <Row justify="space-between" align="flex-start">
          <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: radii.md,
                  backgroundColor: bg,
                }}
              >
                <Text style={{ color: fg, fontFamily: type.familyBold, fontSize: 13 }}>
                  {labelMap[a.mode]}
                </Text>
              </View>
              <Text style={{ color: t.inkMute, fontFamily: type.family, fontSize: 13 }}>
                {thaiDate.short(new Date(a.date))}
              </Text>
            </Row>
            <Text style={{ fontSize: 14, color: t.ink, fontFamily: type.family }}>
              {detailLine}
            </Text>
            {a.remark ? (
              <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                {a.remark}
              </Text>
            ) : null}
          </Col>
          {amountRight ? (
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: 16,
                color: a.mode === 'sell' ? t.sellInk : t.ink,
                marginLeft: 8,
              }}
            >
              {amountRight}
            </Text>
          ) : null}
        </Row>
      </View>
    </Card>
  );
}
