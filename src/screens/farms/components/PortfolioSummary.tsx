import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Pill } from '@/components/ui';
import { fmt } from '@/utils/fmt';

type Props = {
  farmCount: number;
  totalFish: number;
  activePonds: number;
  totalPonds: number;
  maintCount: number;
};

/**
 * The screen anchor. Leads with the portfolio-wide fish roll-up (the biggest
 * number on the screen) so the eye lands here first, then hands off to the
 * per-farm cards. A maintenance chip routes attention when any farm is down.
 */
export function PortfolioSummary({
  farmCount,
  totalFish,
  activePonds,
  totalPonds,
  maintCount,
}: Props) {
  const { t, shadow } = useTheme();
  const hasStock = totalFish > 0;

  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.borderStrong,
        borderRadius: radii.xl,
        padding: space[5],
        ...shadow,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space[2],
        }}
      >
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.familyMedium,
            color: t.inkMute,
            lineHeight: 18,
          }}
        >
          ปลารวมทุกฟาร์ม
        </Text>
        {maintCount > 0 ? <Pill tone="maint">{`${maintCount} ปิดปรับปรุง`}</Pill> : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: space[1] }}>
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: type.sizes.xxl,
            color: hasStock ? t.ink : t.inkMute,
            lineHeight: 34,
          }}
        >
          {fmt.num(totalFish)}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.md,
            fontFamily: type.familyMedium,
            color: t.inkMute,
            marginLeft: space[2],
          }}
        >
          ตัว
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: t.border, marginVertical: space[4] }} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FooterStat label="ฟาร์ม" value={String(farmCount)} />
        <View
          style={{ width: 1, height: 28, backgroundColor: t.border, marginHorizontal: space[5] }}
        />
        <FooterStat
          label="บ่อใช้งาน"
          value={`${activePonds} / ${totalPonds}`}
          accent={activePonds > 0 ? t.statusActive : undefined}
        />
      </View>
    </View>
  );
}

function FooterStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  const { t } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <Text
        style={{
          fontFamily: type.familyNumSemi,
          fontSize: type.sizes.lg,
          color: accent ?? t.ink,
          lineHeight: 22,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.family,
          color: t.inkMute,
          lineHeight: 15,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
