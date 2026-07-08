import { Platform, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { StatusBadge } from '@/components/domain/StatusPip';
import { fmt, FISH_TH } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { PondModel } from '@/features/pond';

type Props = { pond: PondModel; onPress?: () => void };

const CLOSE_LABEL: Record<'fill' | 'move' | 'sell', string> = {
  fill: 'เติม',
  move: 'ย้าย',
  sell: 'ขาย',
};

/**
 * Flat, fixed-height pond row. Both active and maintenance states share the same
 * two-line skeleton (name + status / one meta line) so the list reads as an even
 * rhythm; active ponds carry a compact fish-count metric on the right.
 */
export function PondRowCard({ pond, onPress }: Props) {
  const { t } = useTheme();
  const isMaintenance = pond.status === 'maintenance';

  const fishText = pond.fishTypes.map((ft) => FISH_TH[ft] ?? ft).join(', ');
  const activeMeta = [fishText, `อายุ ${pond.ageDays ?? 0} วัน`].filter(Boolean).join(' · ');
  const maintMeta =
    pond.latestActivityDate && pond.latestActivityType
      ? `ปิดอยู่ · ${CLOSE_LABEL[pond.latestActivityType]} ${thaiDate.short(new Date(pond.latestActivityDate))}`
      : 'ปิดอยู่ — เริ่มรอบใหม่ได้';

  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <Row
        align="center"
        gap={10}
        style={{ paddingHorizontal: space[4], paddingVertical: space[3] }}
      >
        <Col gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={8} align="center">
            <Text
              numberOfLines={1}
              style={{
                fontSize: type.sizes.md,
                fontFamily: type.familyBold,
                color: t.ink,
                lineHeight: 22,
                flexShrink: 1,
                ...Platform.select({ android: { includeFontPadding: false } }),
              }}
            >
              {`บ่อ ${pond.name}`}
            </Text>
            {/* Neutralize the Pill's own alignSelf so it centres in the row */}
            <View>
              <StatusBadge s={pond.status} />
            </View>
          </Row>
          <Text
            numberOfLines={1}
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 18,
            }}
          >
            {isMaintenance ? maintMeta : activeMeta}
          </Text>
        </Col>

        {!isMaintenance ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: type.sizes.lg,
                color: pond.totalFish > 0 ? t.ink : t.inkMute,
              }}
            >
              {fmt.num(pond.totalFish)}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.xs,
                color: t.inkMute,
                fontFamily: type.familyMedium,
                marginLeft: 3,
              }}
            >
              ตัว
            </Text>
          </View>
        ) : null}

        {!isMaintenance ? <PondStatusDot pond={pond} /> : null}
      </Row>
    </Card>
  );
}

function PondStatusDot({ pond }: { pond: PondModel }) {
  const { t } = useTheme();
  const color = pond.loggedToday ? t.success : pond.lateDays > 0 ? t.danger : t.warn;
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
}
