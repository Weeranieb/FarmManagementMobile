import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { maintInk } from '@/theme/ink';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import { fmt, displayFarmName } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';

type Props = {
  farm: FarmModel;
  onPress?: () => void;
};

/**
 * Flat, fixed-height farm row. Active / maintenance / empty all share one
 * two-line skeleton (icon + name/status, one utilisation meta line) so the list
 * reads as an even rhythm; farms with ponds carry a compact fish-count metric.
 */
export function FarmCard({ farm, onPress }: Props) {
  const { t, shadow, mode } = useTheme();
  const name = displayFarmName(farm.name);
  const isEmpty = farm.pondCount === 0;
  const isMaint = farm.status === 'maintenance';
  const tileMode = isEmpty ? 'empty' : isMaint ? 'maint' : 'active';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: space[4],
        paddingVertical: space[5],
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: isEmpty ? t.border : t.borderStrong,
        backgroundColor: isEmpty ? t.surfaceAlt : t.surface,
        ...(isEmpty ? null : shadow),
      }}
    >
      <IconTile mode={tileMode} />

      <Col gap={3} style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: type.sizes.lg,
            fontFamily: type.familyBold,
            color: isEmpty ? t.inkSoft : t.ink,
            lineHeight: 24,
          }}
        >
          {name}
        </Text>

        {isEmpty ? (
          <Text
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 18,
            }}
          >
            ยังไม่มีบ่อ
          </Text>
        ) : isMaint ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 18,
            }}
          >
            <Text style={{ fontFamily: type.familyMedium, color: maintInk(mode, t) }}>
              ปิดปรับปรุง
            </Text>
            <Text> · {farm.pondCount} บ่อ</Text>
          </Text>
        ) : (
          <Text
            numberOfLines={1}
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              lineHeight: 18,
            }}
          >
            <Text
              style={{
                fontFamily: type.familyNumSemi,
                color: farm.activePonds > 0 ? t.statusActive : t.inkMute,
              }}
            >
              {farm.activePonds}
            </Text>
            <Text style={{ fontFamily: type.familyNum }}> / {farm.pondCount}</Text>
            <Text> บ่อใช้งาน</Text>
          </Text>
        )}
      </Col>

      {!isEmpty ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: type.sizes.xl,
              color: farm.totalStock > 0 ? t.ink : t.inkMute,
            }}
          >
            {fmt.num(farm.totalStock)}
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

      <Icon.chevR size={18} color={isEmpty ? t.inkMute : t.inkSoft} />
    </Pressable>
  );
}

function IconTile({ mode }: { mode: 'active' | 'maint' | 'empty' }) {
  const { t } = useTheme();
  const map = {
    active: [t.brandSoft, t.brand],
    maint: [t.statusMaintSoft, t.statusMaint],
    empty: [t.surfaceSunk, t.inkMute],
  } as const;
  const [bg, fg] = map[mode];
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: radii.md,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon.farm size={22} color={fg} />
    </View>
  );
}
