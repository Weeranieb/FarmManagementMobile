import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { dangerInk } from '@/theme/ink';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { TH_MONTH_NAMES_SHORT, thaiDate } from '@/locale/thaiDate';
import type { FeedPriceHistoryEntry } from '@/features/feed-collection';

type Props = {
  /** Newest-first list. */
  entries: FeedPriceHistoryEntry[];
};

export function TimelineList({ entries }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ marginTop: 4 }}>
      <View
        style={{
          paddingHorizontal: 4,
          paddingTop: 4,
          paddingBottom: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: type.familyBold, color: t.ink }}>
          ประวัติราคา
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
          <Text style={{ fontFamily: type.familyNumSemi }}>{entries.length}</Text> รายการ
        </Text>
      </View>
      <Card padded={false}>
        {entries.map((e, i) => {
          // "prev" for the delta chip = the older entry (next in this newest-
          // first list).
          const prev = entries[i + 1];
          const delta = prev ? e.price - prev.price : null;
          const pct = prev ? (delta! / prev.price) * 100 : null;
          return (
            <PriceRow
              key={e.id}
              entry={e}
              delta={delta}
              pct={pct}
              last={i === entries.length - 1}
            />
          );
        })}
      </Card>
    </View>
  );
}

function PriceRow({
  entry,
  delta,
  pct,
  last,
}: {
  entry: FeedPriceHistoryEntry;
  delta: number | null;
  pct: number | null;
  last: boolean;
}) {
  const { t, mode } = useTheme();
  const d = new Date(entry.effectiveDate);

  let chipBg = t.surfaceAlt;
  let chipFg = t.inkMute;
  let chipText = 'รายการแรก';
  if (delta != null && pct != null) {
    if (delta > 0) {
      chipBg = t.dangerSoft;
      chipFg = dangerInk(mode, t);
      chipText = `+${pct.toFixed(1)}%`;
    } else if (delta < 0) {
      chipBg = t.fillSoft;
      chipFg = t.fillInk;
      chipText = `${pct.toFixed(1)}%`;
    } else {
      chipBg = t.surfaceAlt;
      chipFg = t.inkSoft;
      chipText = '0.0%';
    }
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: type.familyNumBold,
            color: t.ink,
            lineHeight: 16,
          }}
        >
          {d.getDate()}
        </Text>
        <Text
          style={{
            fontSize: 9,
            fontFamily: type.familyNumSemi,
            color: t.inkMute,
            marginTop: 2,
          }}
        >
          {TH_MONTH_NAMES_SHORT[d.getMonth()]}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, color: t.ink, fontFamily: type.familySemi }}
        >
          {thaiDate.long(d)}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
          {thaiDate.ago(d)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 17,
            color: t.ink,
          }}
        >
          {fmt.baht(entry.price)}
        </Text>
        <Row
          gap={4}
          style={{
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 9999,
            backgroundColor: chipBg,
          }}
        >
          {delta != null && delta !== 0 ? (
            <Icon.arrow size={11} color={chipFg} />
          ) : delta === 0 ? (
            <Icon.arrow size={11} color={chipFg} />
          ) : null}
          <Text style={{ color: chipFg, fontSize: 11, fontFamily: type.familyNumBold }}>
            {chipText}
          </Text>
        </Row>
      </View>
    </View>
  );
}
