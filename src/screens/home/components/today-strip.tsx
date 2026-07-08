import { Text, View } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { dangerInk } from '@/theme/ink';
import { radii, space, type } from '@/theme/tokens';
import type { HomeDigest } from '../constants';

type Props = { digest: HomeDigest };

/**
 * "วันนี้" readout — three honest stats in ONE sunken ribbon divided by
 * hairlines, not three separate cards (which just repeated the card rhythm of
 * the rows above). ค่าอาหาร / ปลาตาย show "—" — never "฿0" — when there's no
 * log yet; deaths turn danger-toned once there's a real non-zero count.
 */
export function TodayStrip({ digest }: Props) {
  const { t } = useTheme();
  const { totalFish, feedCostToday, deathsToday, loggedCount } = digest;
  const haveTodayData = loggedCount > 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: t.border,
        paddingVertical: space[3],
      }}
    >
      <StatCell
        label="ปลาคงเหลือ"
        value={totalFish.toLocaleString('en-US')}
        unit="ตัว"
        caption="ทุกบ่อใช้งาน"
      />
      <Divider />
      <StatCell
        label="ค่าอาหารวันนี้"
        value={
          haveTodayData && feedCostToday != null
            ? `฿${Math.round(feedCostToday).toLocaleString('en-US')}`
            : '—'
        }
        caption={haveTodayData ? `จาก ${loggedCount} บ่อ` : 'ยังไม่มีบันทึก'}
        dim={!haveTodayData}
      />
      <Divider />
      <StatCell
        label="ปลาตายวันนี้"
        value={haveTodayData && deathsToday != null ? String(deathsToday) : '—'}
        unit={haveTodayData && deathsToday != null ? 'ตัว' : undefined}
        caption={haveTodayData ? `ใน ${loggedCount} บ่อ` : 'ยังไม่มีบันทึก'}
        dim={!haveTodayData}
        danger={haveTodayData && deathsToday != null && deathsToday > 0}
      />
    </View>
  );
}

function Divider() {
  const { t } = useTheme();
  return <View style={{ width: 1, backgroundColor: t.border, marginVertical: 2 }} />;
}

type CellProps = {
  label: string;
  value: string;
  unit?: string;
  caption: string;
  dim?: boolean;
  danger?: boolean;
};

function StatCell({ label, value, unit, caption, dim, danger }: CellProps) {
  const { t, mode } = useTheme();
  const valueColor = dim ? t.inkMute : danger ? dangerInk(mode, t) : t.ink;
  return (
    <View style={{ flex: 1, paddingHorizontal: space[3] }}>
      <Text
        numberOfLines={1}
        style={{ fontSize: 11, fontFamily: type.familySemi, color: t.inkMute, letterSpacing: 0.2 }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 23,
            color: valueColor,
            letterSpacing: -0.5,
            lineHeight: 26,
            flexShrink: 1,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{unit}</Text>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={{ fontSize: 11, color: t.inkMute, marginTop: 3, fontFamily: type.family }}
      >
        {caption}
      </Text>
    </View>
  );
}

export function TodayStripSkeleton() {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: t.border,
        paddingVertical: space[3],
      }}
    >
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flex: 1, paddingHorizontal: space[3] }}>
          <Skeleton width={64} height={8} />
          <View style={{ height: 8 }} />
          <Skeleton width={56} height={20} radius={6} />
          <View style={{ height: 6 }} />
          <Skeleton width={50} height={8} />
        </View>
      ))}
    </View>
  );
}
