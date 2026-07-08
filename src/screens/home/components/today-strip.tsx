import { Text, View } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { dangerInk } from '@/theme/ink';
import { radii, space, type } from '@/theme/tokens';
import type { HomeDigest } from '../constants';

type Props = { digest: HomeDigest };

/**
 * Honest three-up "วันนี้" strip. ค่าอาหารวันนี้ / ปลาตายวันนี้ show "—"
 * when no daily log exists for today — never "฿0" — so the user doesn't
 * read silence as "no fish died today".
 *
 * Sunken (surfaceAlt) tiles read as "data to glance at", visually distinct
 * from the raised white action tiles above them. Deaths turn danger-toned
 * once there's a real non-zero count, so a bad day pulls the eye.
 */
export function TodayStrip({ digest }: Props) {
  const { totalFish, feedCostToday, deathsToday, loggedCount } = digest;
  const haveTodayData = loggedCount > 0;

  return (
    <View style={{ flexDirection: 'row', gap: space[2] }}>
      <StatCell
        label="ปลาคงเหลือ"
        value={totalFish.toLocaleString('en-US')}
        unit="ตัว"
        caption="ทุกบ่อใช้งาน"
      />
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
    <View
      style={{
        flex: 1,
        padding: space[3],
        borderRadius: radii.md,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          fontFamily: type.familySemi,
          color: t.inkMute,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
        }}
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
            fontSize: 25,
            color: valueColor,
            letterSpacing: -0.6,
            lineHeight: 28,
            flexShrink: 1,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>{unit}</Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 11, color: t.inkMute, marginTop: 4, fontFamily: type.family }}>
        {caption}
      </Text>
    </View>
  );
}

export function TodayStripSkeleton() {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space[2] }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            padding: space[3],
            borderRadius: radii.md,
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Skeleton width={70} height={8} />
          <View style={{ height: 8 }} />
          <Skeleton width={64} height={22} radius={6} />
          <View style={{ height: 6 }} />
          <Skeleton width={60} height={8} />
        </View>
      ))}
    </View>
  );
}
