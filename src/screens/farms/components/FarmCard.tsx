import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { maintInk } from '@/theme/ink';
import { Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import { displayFarmName } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';

type Props = {
  farm: FarmModel;
  onPress?: () => void;
};

/**
 * Farm row with the name on its own full-width line so long names wrap to two
 * lines instead of hard-truncating. The right rail carries a pond-utilisation
 * ring (active / total) rather than a raw fish count — in a farm chooser, "how
 * much of this farm is running" reads at a glance where a bare stock number was
 * just noise.
 */
export function FarmCard({ farm, onPress }: Props) {
  const { t, shadow, mode } = useTheme();
  const name = displayFarmName(farm.name);
  const isEmpty = farm.pondCount === 0;
  const isMaint = farm.status === 'maintenance';
  const tileMode = isEmpty ? 'empty' : isMaint ? 'maint' : 'active';

  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: space[4],
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: isEmpty ? t.border : t.borderStrong,
        backgroundColor: isEmpty ? t.surfaceAlt : t.surface,
        ...(isEmpty ? null : shadow),
      }}
    >
      <IconTile mode={tileMode} />

      <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: type.sizes.md,
            fontFamily: type.familyBold,
            color: isEmpty ? t.inkSoft : t.ink,
            lineHeight: 22,
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
            <Text>บ่อใช้งาน </Text>
            <Text
              style={{
                fontFamily: type.familyNumSemi,
                color: farm.activePonds > 0 ? t.statusActive : t.inkMute,
              }}
            >
              {farm.activePonds}
            </Text>
            <Text style={{ fontFamily: type.familyNum }}> จาก {farm.pondCount}</Text>
          </Text>
        )}
      </Col>

      {!isEmpty && !isMaint ? (
        <UtilRing active={farm.activePonds} total={farm.pondCount} />
      ) : null}

      <Icon.chevR size={18} color={isEmpty ? t.inkMute : t.inkSoft} />
    </Tappable>
  );
}

/** Active-pond gauge: arc fills to active/total, active count sits in the centre. */
function UtilRing({ active, total }: { active: number; total: number }) {
  const { t } = useTheme();
  const size = 44;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, Math.max(0, active / total)) : 0;
  const on = active > 0;
  const arc = on ? t.statusActive : t.inkMute;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={t.border} strokeWidth={stroke} fill="none" />
        {pct > 0 ? (
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={arc}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform={`rotate(-90 ${c} ${c})`}
          />
        ) : null}
      </Svg>
      <Text
        style={{
          fontFamily: type.familyNumSemi,
          fontSize: type.sizes.sm,
          color: on ? t.statusActive : t.inkMute,
        }}
      >
        {active}
      </Text>
    </View>
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
