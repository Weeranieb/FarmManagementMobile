import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Icon } from '@/components/icons';
import { Pill, Tappable } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { thaiDate } from '@/locale/thaiDate';
import { displayFarmName, displayPondName } from '@/utils/fmt';
import type { HomeDigest, PendingPond } from '../constants';

type Props = {
  digest: HomeDigest;
  /** "today" date used in the chip ("วันนี้ · 22 พ.ค. 69"). */
  date: Date;
  /** True after a Daily Log save — shows a "+3" chip. */
  bumped?: boolean;
  /** How many ponds were saved in the last action — drives the +N chip. */
  justSavedCount?: number;
  onPressCTA?: () => void;
  /** Tap a pending chip → open Daily Log scrolled to that pond. */
  onPressPending?: (pond: PendingPond) => void;
};

// IMPORTANT (NativeWind/css-interop): function-form `style={({pressed}) => …}`
// on Pressable silently drops style props under react-native-css-interop's JSX
// runtime — backgrounds, borders, even flexDirection vanish at runtime. Every
// Pressable in this file therefore takes a STATIC style only; visual chrome
// (background / border / radius / shadow) lives on a wrapper <View>.

/**
 * Primary above-the-fold card. Answers the user's first morning question —
 * "which ponds haven't been logged yet?" — with one large numerator and a
 * full-width CTA. Solid-brand button is intentionally 54 pt tall so it
 * stays tappable with wet/gloved fingers in the sun.
 */
export function DailyLogCard({
  digest,
  date,
  bumped = false,
  justSavedCount = 0,
  onPressCTA,
  onPressPending,
}: Props) {
  const { t, shadow } = useTheme();
  const { activeCount, loggedCount, pending, late } = digest;
  const allDone = loggedCount >= activeCount && activeCount > 0;
  const pct = activeCount > 0 ? Math.round((loggedCount / activeCount) * 100) : 0;

  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: radii.lg + 2,
          padding: space[4] + 2,
          overflow: 'hidden',
        },
        shadow,
      ]}
    >
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontSize: type.sizes.xs - 1,
              fontFamily: type.familyBold,
              color: t.brandInk,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            วันนี้ · {thaiDate.short(date)}
          </Text>
          <Text
            style={{
              fontSize: type.sizes.lg + 1,
              fontFamily: type.familyBold,
              color: t.ink,
              letterSpacing: -0.2,
            }}
          >
            บันทึกประจำวัน
          </Text>
        </View>
        {bumped && justSavedCount > 0 ? (
          <Pill tone="success">
            <Icon.check size={12} color={t.statusActive} />
            <Text
              style={{
                color: t.statusActive,
                fontSize: 12,
                fontFamily: type.familyNumSemi,
                marginLeft: 2,
              }}
            >
              +{justSavedCount}
            </Text>
          </Pill>
        ) : null}
      </View>

      {/* Progress — a bold numerator paired with a completion ring, replacing
          the flat linear bar + pastel wash (both generic templated tells). */}
      <View
        style={{
          marginTop: space[3] + 2,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: 36,
              color: allDone ? t.statusActive : t.ink,
              letterSpacing: -1,
              lineHeight: 38,
            }}
          >
            {loggedCount}
          </Text>
          <Text
            style={{
              fontSize: type.sizes.lg,
              fontFamily: type.familyNumMedium,
              color: t.inkSoft,
            }}
          >
            / {activeCount}
          </Text>
          <Text
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              marginLeft: 4,
              fontFamily: type.family,
            }}
            numberOfLines={1}
          >
            บ่อบันทึกแล้ว
          </Text>
        </View>
        <ProgressRing pct={pct} done={allDone} />
      </View>

      {allDone ? (
        <View
          style={{
            marginTop: space[3] + 2,
            paddingVertical: space[2] + 2,
            paddingHorizontal: space[3],
            backgroundColor: t.statusActiveSoft,
            borderRadius: radii.md - 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[2],
          }}
        >
          <Icon.check size={16} color={t.statusActive} />
          <Text
            style={{
              color: t.statusActive,
              fontSize: type.sizes.sm,
              fontFamily: type.familySemi,
            }}
          >
            วันนี้บันทึกครบทุกบ่อ
          </Text>
        </View>
      ) : (
        <PendingList pending={pending} late={late} onPressPending={onPressPending} />
      )}

      {/* CTA — chrome on the View, static style on the Pressable. The design's
          soft drop shadow (0 4px 12px rgba(33,78,124,.18)) only applies in the
          pending state; the all-done state is a flat neutral surface. */}
      <View
        style={[
          {
            marginTop: space[3] + 2,
            borderRadius: radii.md,
            backgroundColor: allDone ? t.surfaceAlt : t.brand,
            overflow: 'hidden',
          },
          allDone
            ? null
            : {
                shadowColor: '#214e7c',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 12,
                elevation: 3,
              },
        ]}
      >
        <Tappable
          onPress={onPressCTA}
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
          style={{
            height: 54,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space[2],
          }}
        >
          <Text
            style={{
              color: allDone ? t.brandInk : '#fff',
              fontSize: type.sizes.md,
              fontFamily: type.familyBold,
            }}
          >
            {allDone ? 'เปิดดูรายเดือน' : 'เปิดบันทึกประจำวัน'}
          </Text>
          <Icon.arrow size={18} color={allDone ? t.brandInk : '#fff'} stroke={2} />
        </Tappable>
      </View>
    </View>
  );
}

function ProgressRing({ pct, done }: { pct: number; done: boolean }) {
  const { t } = useTheme();
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (circumference * Math.min(Math.max(pct, 0), 100)) / 100;
  const color = done ? t.statusActive : t.brand;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.surfaceSunk}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </Svg>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 12.5,
          color: done ? t.statusActive : t.inkSoft,
          letterSpacing: -0.3,
        }}
      >
        {pct}%
      </Text>
    </View>
  );
}

// Per farm: show this many pond chips, then collapse the rest into "อีก N บ่อ".
const MAX_CHIPS_PER_FARM = 3;

/**
 * "ยังไม่ได้บันทึก" — pending ponds grouped by farm. Each farm shows its name,
 * how many of its ponds are still un-logged, and up to three pond chips (late
 * ponds lead so they stay visible when capped). This answers "which farm still
 * needs me?" — the unit a farmer actually walks to — instead of a flat chip
 * list. Per the final design, late ponds carry no red tint or "เลย Nว" text;
 * every chip is the same neutral grey.
 */
function PendingList({
  pending,
  late: _late,
  onPressPending,
}: {
  pending: PendingPond[];
  late: PendingPond[];
  onPressPending?: (pond: PendingPond) => void;
}) {
  const { t } = useTheme();
  if (pending.length === 0) return null;

  // Group by farm, preserving the order farms first appear in `pending` (which
  // follows farm-list order). Within a farm, late ponds sort first.
  const groups: { farm: string; ponds: PendingPond[] }[] = [];
  const groupByFarm = new Map<string, { farm: string; ponds: PendingPond[] }>();
  for (const p of pending) {
    const key = p.farmName || '';
    let group = groupByFarm.get(key);
    if (!group) {
      group = { farm: key, ponds: [] };
      groupByFarm.set(key, group);
      groups.push(group);
    }
    group.ponds.push(p);
  }
  groups.forEach((g) => g.ponds.sort((a, b) => (b.lateDays || 0) - (a.lateDays || 0)));

  return (
    <View style={{ marginTop: space[3] + 2 }}>
      <Text
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familySemi,
          color: t.inkMute,
          marginBottom: 8,
          letterSpacing: 0.3,
        }}
      >
        ยังไม่ได้บันทึก
      </Text>
      <View style={{ gap: space[3] }}>
        {groups.map((g) => {
          const visible = g.ponds.slice(0, MAX_CHIPS_PER_FARM);
          const rest = g.ponds.length - visible.length;
          return (
            <View key={g.farm}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 6,
                  marginBottom: 7,
                }}
              >
                <Text
                  style={{
                    fontSize: type.sizes.xs + 1,
                    fontFamily: type.familyBold,
                    color: t.ink,
                  }}
                >
                  {displayFarmName(g.farm)}
                </Text>
                <Text
                  style={{
                    fontSize: type.sizes.xs,
                    fontFamily: type.familyNum,
                    color: t.inkMute,
                  }}
                >
                  {g.ponds.length} บ่อ
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {visible.map((p) => (
                  <View
                    key={p.id}
                    style={{
                      borderRadius: radii.pill,
                      backgroundColor: t.surfaceAlt,
                      borderWidth: 1,
                      borderColor: t.border,
                      overflow: 'hidden',
                    }}
                  >
                    <Tappable
                      onPress={onPressPending ? () => onPressPending(p) : undefined}
                      android_ripple={{ color: t.border }}
                      style={{ paddingHorizontal: 10, paddingVertical: 6 }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          color: t.ink,
                          fontSize: type.sizes.xs + 1,
                          fontFamily: type.familySemi,
                        }}
                      >
                        {displayPondName(p.name)}
                      </Text>
                    </Tappable>
                  </View>
                ))}
                {rest > 0 ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: radii.pill,
                      backgroundColor: t.surfaceAlt,
                      borderWidth: 1,
                      borderColor: t.border,
                    }}
                  >
                    <Text
                      style={{
                        color: t.inkSoft,
                        fontSize: type.sizes.xs + 1,
                        fontFamily: type.familySemi,
                      }}
                    >
                      อีก {rest} บ่อ
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
