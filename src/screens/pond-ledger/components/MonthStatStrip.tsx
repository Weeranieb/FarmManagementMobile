import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { fmtCell } from '../ui';

type Props = {
  loggedDays: number;
  denom: number;
  feedBags: number;
  death: number;
};

/** Centered month roll-up under the month nav: logged days / feed bags / deaths. */
export function MonthStatStrip({ loggedDays, denom, feedBags, death }: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        columnGap: 16,
        rowGap: 4,
        paddingHorizontal: 12,
        paddingBottom: 8,
      }}
    >
      <MiniStat
        label={tx('pondLedger.stat.logged')}
        value={`${loggedDays}`}
        unit={tx('pondLedger.stat.loggedOf', { total: denom })}
      />
      <MiniStat
        label={tx('pondLedger.stat.feedTotal')}
        value={fmtCell(feedBags) ?? '0'}
        unit={tx('unit.bag')}
        dot={t.move}
      />
      <MiniStat
        label={tx('pondLedger.stat.deathTotal')}
        value={`${death}`}
        unit={tx('unit.fish')}
        dot={t.warn}
      />
    </View>
  );
}

function MiniStat({ label, value, unit, dot }: { label: string; value: string; unit: string; dot?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
      <Text style={{ fontSize: 11.5, lineHeight: 16, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
      <Text style={{ fontFamily: type.familyNumBold, fontSize: 13, color: t.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: t.inkMute, fontFamily: type.family }}>{unit}</Text>
    </View>
  );
}
