import { View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { fmtCell } from '../ui';

type Props = {
  loggedDays: number;
  denom: number;
  feedKg: number;
  death: number;
};

/** Centered month roll-up under the month nav: logged days / feed kg / deaths. */
export function MonthStatStrip({ loggedDays, denom, feedKg, death }: Props) {
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
      <MiniStat label="บันทึก" value={`${loggedDays}`} unit={`/ ${denom} วัน`} />
      <MiniStat label="อาหารรวม" value={fmtCell(feedKg) ?? '0'} unit="กก." dot={t.move} />
      <MiniStat label="ตายรวม" value={`${death}`} unit="ตัว" dot={t.warn} />
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
