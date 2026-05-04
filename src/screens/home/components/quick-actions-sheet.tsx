import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconProps } from '@/components/icons';
import { space, type, type ThemePalette } from '@/theme/tokens';

export type QuickActionId = 'fill' | 'move' | 'sell' | 'logFeed';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (id: QuickActionId) => void;
};

type Tone = 'fill' | 'move' | 'sell' | 'brand';

/** Matches `Farm OS/screens-home.jsx` SheetQuickActions icon well. */
const WELL = 44;
const ICON_WELL_RADIUS = 12;
const SHEET_TOP_RADIUS = 20;
const ROW_RADIUS = 14;
/** Vertical space between action rows (sheet background shows in the gap). */
const ROW_GAP = space[3];
const ROW_INNER_GAP = 14;

const ROW_SEMANTICS: Record<
  QuickActionId,
  { Ico: (p: IconProps) => ReactElement; tone: Tone; labelKey: string; subKey: string }
> = {
  fill: {
    Ico: Icon.plus,
    tone: 'fill',
    labelKey: 'flow.fill',
    subKey: 'home.quickActions.fillSub',
  },
  move: {
    Ico: Icon.swap,
    tone: 'move',
    labelKey: 'flow.move',
    subKey: 'home.quickActions.moveSub',
  },
  sell: { Ico: Icon.tag, tone: 'sell', labelKey: 'flow.sell', subKey: 'home.quickActions.sellSub' },
  logFeed: {
    Ico: Icon.feed,
    tone: 'brand',
    labelKey: 'home.quickActions.logFeed',
    subKey: 'home.quickActions.feedSub',
  },
};

function toneSolid(palette: ThemePalette, tone: Tone): string {
  switch (tone) {
    case 'fill':
      return palette.fill;
    case 'move':
      return palette.move;
    case 'sell':
      return palette.sell;
    default:
      return palette.brand;
  }
}

function toneInk(palette: ThemePalette, tone: Tone): string {
  switch (tone) {
    case 'fill':
      return palette.fillInk;
    case 'move':
      return palette.moveInk;
    case 'sell':
      return palette.sellInk;
    default:
      return palette.brandInk;
  }
}

function toneSoftKey(tone: Tone): keyof ThemePalette {
  switch (tone) {
    case 'fill':
      return 'fillSoft';
    case 'move':
      return 'moveSoft';
    case 'sell':
      return 'sellSoft';
    default:
      return 'brandSoft';
  }
}

export function QuickActionsSheet({ visible, onClose, onPick }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const insets = useSafeAreaInsets();

  const rows: QuickActionId[] = ['fill', 'move', 'sell', 'logFeed'];
  /** Web prototype: `padding: 10px 16px 28px` + device safe area. */
  const sheetPaddingBottom = 28 + Math.max(insets.bottom, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10,15,25,0.45)' }]}
          accessibilityRole="button"
          accessibilityLabel={tx('common.cancel')}
        />
        <View
          style={{
            width: '100%',
            alignSelf: 'stretch',
            paddingTop: 10,
            paddingHorizontal: 16,
            paddingBottom: sheetPaddingBottom,
            backgroundColor: t.surface,
            borderTopLeftRadius: SHEET_TOP_RADIUS,
            borderTopRightRadius: SHEET_TOP_RADIUS,
            overflow: 'hidden',
          }}
        >
          <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 14 }}>
            <View
              style={{
                width: 42,
                height: 5,
                borderRadius: 3,
                backgroundColor: t.borderStrong,
              }}
            />
          </View>

          <Text
            style={{
              fontFamily: type.familyBold,
              fontSize: 18,
              color: t.ink,
              marginBottom: 6,
            }}
          >
            {tx('home.quickActions.title')}
          </Text>
          <Text style={{ color: t.inkMute, fontSize: 13, marginBottom: 14 }}>
            {tx('home.quickActions.sub')}
          </Text>

          <View style={{ gap: ROW_GAP }}>
            {rows.map((id) => {
              const { Ico, tone: rowTone, labelKey, subKey } = ROW_SEMANTICS[id];
              const softBg = t[toneSoftKey(rowTone)];
              const solid = toneSolid(t, rowTone);
              const ink = toneInk(t, rowTone);

              return (
                <Pressable
                  key={id}
                  onPress={() => onPick(id)}
                  android_ripple={{ color: t.surfaceAlt }}
                  accessibilityRole="button"
                  accessibilityLabel={`${tx(labelKey)}. ${tx(subKey)}`}
                  style={({ pressed }) => ({
                    width: '100%',
                    opacity: pressed ? 0.92 : 1,
                  })}
                >
                  {/* Row on inner View: Pressable + flex row is unreliable for flex:1 text width on some RN builds. */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: ROW_RADIUS,
                      backgroundColor: softBg,
                    }}
                  >
                    <View
                      style={{
                        width: WELL,
                        height: WELL,
                        borderRadius: ICON_WELL_RADIUS,
                        marginRight: ROW_INNER_GAP,
                        backgroundColor: solid,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ico size={22} color="#ffffff" stroke={2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontFamily: type.familyBold,
                          color: ink,
                          fontSize: 16,
                        }}
                      >
                        {tx(labelKey)}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: t.inkSoft,
                          fontSize: 13,
                        }}
                      >
                        {tx(subKey)}
                      </Text>
                    </View>
                    <View style={{ width: 22, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.chevR size={18} color={ink} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
