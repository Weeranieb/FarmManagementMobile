import { Platform, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { FishChips } from '@/components/domain/FishChips';
import { StatusBadge } from '@/components/domain/StatusPip';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { PondModel } from '@/features/pond';

type Props = { pond: PondModel; onPress?: () => void };

export function PondRowCard({ pond, onPress }: Props) {
  const { t } = useTheme();
  const isMaintenance = pond.status === 'maintenance';

  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" align="flex-start" style={{ marginBottom: 10 }}>
          <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Row gap={8} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  lineHeight: 24,
                  ...Platform.select({ android: { includeFontPadding: false } }),
                }}
              >
                {`บ่อ ${pond.name}`}
              </Text>
              {/* Pill uses alignSelf: 'flex-start' — wrap so Row alignItems:center applies */}
              <View style={{ alignSelf: 'center' }}>
                <StatusBadge s={pond.status} />
              </View>
            </Row>
            {!isMaintenance && pond.fishTypes.length > 0 ? (
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                <FishChips types={pond.fishTypes} />
              </Row>
            ) : null}
          </Col>
          {!isMaintenance ? <PondStatusDot pond={pond} /> : null}
        </Row>
        {!isMaintenance ? (
          <Row gap={20} style={{ paddingTop: 2, marginBottom: 8 }}>
            <PondMiniStat label="ปลาในบ่อ (ตัว)" v={fmt.num(pond.totalFish)} />
            <PondMiniStat label="อายุรอบ" v={String(pond.ageDays ?? 0)} sub="วัน" />
          </Row>
        ) : (
          <Text
            style={{ fontSize: 13, color: t.inkSoft, fontFamily: type.family, marginBottom: 8 }}
          >
            บ่อปิดอยู่ — กดเพื่อเริ่มรอบใหม่
          </Text>
        )}
        {pond.latestActivityDate && pond.latestActivityType ? (
          <Row gap={8} align="center" style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: t.border }}>
            <ActivityModePill mode={pond.latestActivityType} />
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              · {thaiDate.ago(new Date(pond.latestActivityDate))}
            </Text>
          </Row>
        ) : null}
      </View>
    </Card>
  );
}

function PondStatusDot({ pond }: { pond: PondModel }) {
  const { t } = useTheme();
  const color = pond.loggedToday ? t.success : pond.lateDays > 0 ? t.danger : t.warn;
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginTop: 4,
      }}
    />
  );
}

function ActivityModePill({ mode }: { mode: 'fill' | 'move' | 'sell' }) {
  const { t } = useTheme();
  const map = {
    fill: { bg: t.fillSoft, fg: t.fillInk, label: 'เติม' },
    move: { bg: t.moveSoft, fg: t.moveInk, label: 'ย้าย' },
    sell: { bg: t.sellSoft, fg: t.sellInk, label: 'ขาย' },
  } as const;
  const m = map[mode];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radii.xs,
        backgroundColor: m.bg,
      }}
    >
      <Text style={{ color: m.fg, fontFamily: type.familySemi, fontSize: 12 }}>{m.label}</Text>
    </View>
  );
}

function PondMiniStat({ label, v, sub }: { label: string; v: string; sub?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'flex-start', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 20, color: t.ink }}>{v}</Text>
        {sub ? (
          <Text
            style={{ fontSize: 11, color: t.inkMute, marginLeft: 3, fontFamily: type.familyMedium }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
    </View>
  );
}
