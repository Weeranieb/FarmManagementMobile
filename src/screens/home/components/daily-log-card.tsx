import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { thaiDate } from '@/locale/thaiDate';
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

const WASH_HEIGHT = 110;

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
      {/* Soft brand wash fading down from the card top while still pending —
          matches the design's linear-gradient(brandSoft → surface) so there is
          no hard edge mid-card. */}
      {!allDone ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: WASH_HEIGHT }}
        >
          <Svg width="100%" height={WASH_HEIGHT}>
            <Defs>
              <LinearGradient id="dailyLogWash" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={t.brandSoft} stopOpacity={1} />
                <Stop offset="1" stopColor={t.surface} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={WASH_HEIGHT} fill="url(#dailyLogWash)" />
          </Svg>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

      {/* Progress numerator + bar */}
      <View style={{ marginTop: space[3] + 2 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: 32,
                color: allDone ? t.statusActive : t.ink,
                letterSpacing: -1,
                lineHeight: 34,
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
            >
              บ่อบันทึกแล้ว
            </Text>
          </View>
          <Text
            style={{
              fontFamily: type.familyNumSemi,
              fontSize: type.sizes.xs + 1,
              color: t.inkMute,
            }}
          >
            {pct}%
          </Text>
        </View>
        <ProgressBar pct={pct} done={allDone} />
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
        <Pressable
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
        </Pressable>
      </View>
    </View>
  );
}

function ProgressBar({ pct, done }: { pct: number; done: boolean }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        marginTop: space[2] + 2,
        height: 8,
        borderRadius: 4,
        backgroundColor: t.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 4,
          backgroundColor: done ? t.statusActive : t.brand,
        }}
      />
    </View>
  );
}

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
  const visible = pending.slice(0, 3);
  const rest = pending.length - visible.length;

  return (
    <View style={{ marginTop: space[3] + 2 }}>
      <Text
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familySemi,
          color: t.inkMute,
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        ยังไม่ได้บันทึก
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {visible.map((p) => {
          const isLate = p.lateDays > 0;
          return (
            <View
              key={p.id}
              style={{
                borderRadius: radii.pill,
                backgroundColor: isLate ? t.dangerSoft : t.surfaceAlt,
                borderWidth: 1,
                borderColor: isLate ? `${t.danger}33` : t.border,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={onPressPending ? () => onPressPending(p) : undefined}
                android_ripple={{ color: t.border }}
                style={{ paddingHorizontal: 10, paddingVertical: 6 }}
              >
                {/* Single Text node — RN guarantees nested <Text> renders
                    inline on one baseline, so "บ่อ 3" and "เลย 1ว" stay on
                    the same line inside the chip the way the design shows. */}
                <Text
                  numberOfLines={1}
                  style={{
                    color: isLate ? t.danger : t.ink,
                    fontSize: type.sizes.xs + 1,
                    fontFamily: type.familySemi,
                  }}
                >
                  {p.name}
                  {isLate ? (
                    <Text
                      style={{
                        color: t.danger,
                        fontSize: type.sizes.xs - 1,
                        fontFamily: type.familyNum,
                        opacity: 0.85,
                      }}
                    >
                      {'  '}เลย {p.lateDays}ว
                    </Text>
                  ) : null}
                </Text>
              </Pressable>
            </View>
          );
        })}
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
              +{rest} บ่อ
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
