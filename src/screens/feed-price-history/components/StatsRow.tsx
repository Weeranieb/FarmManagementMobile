import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { dangerInk } from '@/theme/ink';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FeedPriceHistoryEntry } from '@/features/feed-collection';
import { average } from '../historyUtils';

type Props = {
  data: FeedPriceHistoryEntry[];
};

export function StatsRow({ data }: Props) {
  const { t, mode } = useTheme();
  const { t: tx } = useTranslation();
  if (data.length === 0) return null;

  const prices = data.map((d) => d.price);
  const maxP = Math.max(...prices);
  const minP = Math.min(...prices);
  // `prices.indexOf(...)` returns a valid index because the value came from the
  // same array, but `noUncheckedIndexedAccess` widens the type to `| undefined`.
  // The `!` is safe; the `?? data[0]!` fallback keeps the runtime defensible.
  const maxAt = (data[prices.indexOf(maxP)] ?? data[0]!).effectiveDate;
  const minAt = (data[prices.indexOf(minP)] ?? data[0]!).effectiveDate;
  const avg = average(prices);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <StatTile
        label={tx('feedPrice.stats.high')}
        value={fmt.baht(maxP)}
        sub={thaiDate.short(new Date(maxAt))}
        accent={dangerInk(mode, t)}
      />
      <StatTile
        label={tx('feedPrice.stats.low')}
        value={fmt.baht(minP)}
        sub={thaiDate.short(new Date(minAt))}
        accent={t.fillInk}
      />
      <StatTile
        label={tx('feedPrice.stats.avg')}
        value={fmt.baht(avg)}
        sub={tx('feedPrice.stats.points', { count: data.length })}
      />
    </View>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  const { t, shadow } = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 12,
          gap: 2,
        },
        shadow,
      ]}
    >
      <Text
        style={{
          fontSize: 10.5,
          fontFamily: type.familyBold,
          color: t.inkMute,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 18,
          color: accent ?? t.ink,
          letterSpacing: -0.3,
          lineHeight: 22,
        }}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={{ fontSize: 10.5, color: t.inkMute, fontFamily: type.familyNum }}
      >
        {sub}
      </Text>
    </View>
  );
}
