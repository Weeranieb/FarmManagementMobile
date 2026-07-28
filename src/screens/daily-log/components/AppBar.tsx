import { StyleSheet, View, Text } from 'react-native';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = {
  scrollT: number;
  dirtyCount: number;
  dateLabel: string;
  onBack?: () => void;
  onPillPress?: () => void;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Left inset that aligns secondary rows (the eyebrow kicker) with the title:
// row padding (14) + back button (36) + row gap (6).
const TITLE_INSET = 56;

export function AppBar({ scrollT, dirtyCount, dateLabel, onBack, onPillPress }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();

  const eyebrowH = lerp(14, 0, clamp01(scrollT / 0.625));
  const eyebrowOp = lerp(1, 0, clamp01(scrollT / 0.45));
  const dateOp = lerp(0, 1, clamp01((scrollT - 0.55) / 0.25));
  // Fade the divider + shadow in as the chrome collapses. When the chrome is
  // fully expanded (scrollT = 0) the AppBar sits flush against the same-color
  // surface below, so any divider reads as a visible seam.
  const dividerT = clamp01((scrollT - 0.5) / 0.4);

  return (
    <View
      style={{
        backgroundColor: t.surface,
        paddingTop: 8,
        borderBottomWidth: dividerT > 0 ? StyleSheet.hairlineWidth : 0,
        borderBottomColor: t.border,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04 * dividerT,
        shadowRadius: 6,
        elevation: 2 * dividerT,
        zIndex: 10,
      }}
    >
      {/* Eyebrow kicker — collapses on scroll. Indented to sit above the title. */}
      <View
        style={{
          height: eyebrowH,
          opacity: eyebrowOp,
          overflow: 'hidden',
          paddingLeft: TITLE_INSET,
          paddingRight: 14,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10.5,
            color: t.inkMute,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            fontFamily: type.familyBold,
          }}
        >
          {tx('daily.appbarSub')}
        </Text>
      </View>

      {/* Main row — back · title/date · pill, all centered on a single line */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Tappable
          onPress={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={tx('common.back')}
        >
          <Icon.back size={20} color={t.inkSoft} />
        </Tappable>

        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontFamily: type.familyBold,
              letterSpacing: 0.1,
              color: t.ink,
              fontSize: 16,
            }}
          >
            {tx('daily.appbarTitle')}
          </Text>

          {dateOp > 0.02 ? (
            <View
              style={{
                flexShrink: 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: dateOp,
              }}
            >
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: t.borderStrong,
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: type.familyNumSemi,
                  fontSize: 13,
                  color: t.inkSoft,
                }}
              >
                {dateLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {dirtyCount > 0 ? (
          <Tappable
            onPress={onPillPress}
            style={{
              flexShrink: 0,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: t.warnSoft,
              backgroundColor: t.warnSoft,
            }}
            accessibilityRole="button"
            accessibilityLabel={tx('daily.notLogged', { count: dirtyCount })}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: t.warn,
              }}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: type.familyBold,
                color: t.warn,
              }}
            >
              {tx('daily.notLoggedShort')}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: type.familyNumBold,
                color: t.warn,
              }}
            >
              {dirtyCount}
            </Text>
          </Tappable>
        ) : null}
      </View>
    </View>
  );
}
