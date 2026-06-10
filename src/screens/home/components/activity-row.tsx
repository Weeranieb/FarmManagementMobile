import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import type { ThemePalette } from '@/theme/tokens';

export type ActivityKind = 'feed' | 'fill' | 'move' | 'sell' | 'buy';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Human "เมื่อวาน 16:00" / "2 วันก่อน" / "เมื่อสักครู่" label. */
  whenLabel: string;
  pond: string;
  text: string;
  by?: string;
  extra?: string;
  /** Source record reference — used to deep-link when row is tapped. */
  recordType?: 'dailyLog' | 'fill' | 'move' | 'sell' | 'buy';
  recordId?: number;
  /** When true, render with brand tint + left stripe (fresh save). */
  fresh?: boolean;
};

type Props = {
  e: ActivityItem;
  divider?: boolean;
  onPress?: () => void;
};

const KIND_LABEL: Record<ActivityKind, string> = {
  feed: 'บันทึกประจำวัน',
  fill: 'เติมปลา',
  move: 'ย้ายปลา',
  sell: 'ขายปลา',
  buy: 'ซื้อปลา',
};

function tonePair(kind: ActivityKind, t: ThemePalette) {
  switch (kind) {
    case 'feed':
      return { soft: t.brandSoft, ink: t.brandInk };
    case 'fill':
      return { soft: t.fillSoft, ink: t.fillInk };
    case 'move':
      return { soft: t.moveSoft, ink: t.moveInk };
    case 'sell':
      return { soft: t.sellSoft, ink: t.sellInk };
    case 'buy':
      return { soft: t.warnSoft, ink: t.statusMaint };
  }
}

function Glyph({ kind, color }: { kind: ActivityKind; color: string }) {
  if (kind === 'feed') return <Icon.feed size={16} color={color} />;
  if (kind === 'fill') return <Icon.plus size={16} color={color} stroke={2.2} />;
  if (kind === 'move') return <Icon.swap size={16} color={color} />;
  if (kind === 'sell') return <Icon.tag size={16} color={color} />;
  return <Icon.cycle size={16} color={color} />;
}

/**
 * Activity feed row. Every row routes to its source record so the user has a
 * way back to what they just saved. Fresh state (within ~30 s of a save) is
 * signalled by a brand-tint background + a 3 px left brand stripe — the meta
 * line carries the "เมื่อสักครู่" timestamp; we deliberately don't add a
 * redundant "เพิ่งบันทึก" label.
 */
export function ActivityRow({ e, divider = false, onPress }: Props) {
  const { t } = useTheme();
  const tone = tonePair(e.kind, t);

  const body = (
    <View
      style={{
        flexDirection: 'row',
        gap: space[3],
        paddingVertical: space[3],
        paddingHorizontal: space[3],
        backgroundColor: e.fresh ? t.brandSoft : 'transparent',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.border,
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {e.fresh ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: space[1] + 2,
            bottom: space[1] + 2,
            width: 3,
            borderRadius: 2,
            backgroundColor: t.brand,
          }}
        />
      ) : null}

      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radii.sm,
          backgroundColor: tone.soft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Glyph kind={e.kind} color={tone.ink} />
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Text
            style={{
              fontSize: type.sizes.sm,
              fontFamily: type.familyBold,
              color: t.ink,
            }}
          >
            {e.pond}
          </Text>
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 1,
              borderRadius: radii.xs,
              backgroundColor: tone.soft,
            }}
          >
            <Text
              style={{
                fontSize: type.sizes.xs,
                color: tone.ink,
                fontFamily: type.familySemi,
              }}
            >
              {KIND_LABEL[e.kind]}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: type.sizes.sm,
            color: t.ink,
            fontFamily: type.familyNum,
            lineHeight: 18,
          }}
        >
          {e.text}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Text
            style={{
              fontSize: type.sizes.xs,
              color: t.inkMute,
              fontFamily: type.familyNum,
            }}
          >
            {e.whenLabel}
          </Text>
          {e.by ? (
            <>
              <Text style={{ fontSize: type.sizes.xs, color: t.inkMute }}>·</Text>
              <Text
                style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}
              >
                โดย{e.by}
              </Text>
            </>
          ) : null}
          {e.extra ? (
            <>
              <Text style={{ fontSize: type.sizes.xs, color: t.inkMute }}>·</Text>
              <Text
                style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}
              >
                {e.extra}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={{ alignSelf: 'center' }}>
        <Icon.chevR size={16} color={t.inkMute} stroke={1.8} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        android_ripple={{ color: t.surfaceAlt }}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {body}
      </Pressable>
    );
  }
  return body;
}
