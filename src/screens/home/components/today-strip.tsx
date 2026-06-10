import { Text, View } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import type { HomeDigest } from '../constants';

type Props = { digest: HomeDigest };

/**
 * Honest three-up "วันนี้" strip. ค่าอาหารวันนี้ / ปลาตายวันนี้ show "—"
 * when no daily log exists for today — never "฿0" — so the user doesn't
 * read silence as "no fish died today".
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
};

function StatCell({ label, value, unit, caption, dim }: CellProps) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: space[3],
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10.5,
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
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 18,
            color: dim ? t.inkMute : t.ink,
            letterSpacing: -0.4,
            lineHeight: 20,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{unit}</Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 10.5, color: t.inkMute, marginTop: 4, fontFamily: type.family }}>
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
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Skeleton width={70} height={8} />
          <View style={{ height: 8 }} />
          <Skeleton width={50} height={16} radius={5} />
          <View style={{ height: 6 }} />
          <Skeleton width={60} height={8} />
        </View>
      ))}
    </View>
  );
}
