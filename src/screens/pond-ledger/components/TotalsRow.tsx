import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { DAY_W, colWash, fmtCell, visibleLedgerLeaves } from '../ui';
import { useTouristFishingEnabled } from '@/features/client';

type Props = {
  totals: { pm: number; pe: number; fresh: number; death: number; cat: number };
};

/** Month footer — Σ per column, anchored with a heavier top rule. */
export function TotalsRow({ totals }: Props) {
  const leaves = visibleLedgerLeaves(useTouristFishingEnabled());
  const { t: tx } = useTranslation();
  const { t, mode } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 42,
        borderTopWidth: 2,
        borderTopColor: t.borderStrong,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <View style={{ width: DAY_W, alignItems: 'center', justifyContent: 'center', backgroundColor: t.surfaceAlt }}>
        <Text
          style={{ fontSize: 11, lineHeight: 16, fontFamily: type.familyBold, color: t.inkSoft }}
        >
          {tx('daily.total')}
        </Text>
      </View>
      {leaves.map((l) => (
        <View
          key={l.key}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftWidth: 1,
            borderLeftColor: t.border,
            backgroundColor: colWash(l.group, t, mode),
          }}
        >
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 13, color: t.ink }}>
            {fmtCell(totals[l.key]) ?? '0'}
          </Text>
        </View>
      ))}
    </View>
  );
}
