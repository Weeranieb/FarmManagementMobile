import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { VIBRANT_BRAND } from '../constants';
import i18n from '@/locale/i18n';

export type FarmOption = {
  id: number;
  name: string;
  pondCount: number;
  selected: boolean;
  /** Only meaningful for the active farm — others always 0. */
  dirtyCount: number;
};

type Props = {
  visible: boolean;
  farms: FarmOption[];
  /** Distance from the bottom of the device safe-area top inset (i.e. the
   *  start of usable screen) down to where the dropdown should anchor.
   *  The picker adds the safe-area inset itself so callers don't have to. */
  anchorTop: number;
  onDismiss: () => void;
  onSelect: (id: number) => void;
};

function avatarLetter(name: string): string {
  const stripped = name.replace(/^ฟาร์ม/, '').trim();
  return stripped.charAt(0) || i18n.t('unit.farmPrefix').charAt(0);
}

export function FarmPickerSheet({
  visible,
  farms,
  anchorTop,
  onDismiss,
  onSelect,
}: Props) {
  const { t, shadowLg } = useTheme();
  const { t: tx } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(120)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,18,32,0.32)',
          }}
        >
          <Pressable
            onPress={onDismiss}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            accessibilityRole="button"
            accessibilityLabel={tx('common.close')}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(180)}
          style={[
            {
              position: 'absolute',
              left: 14,
              right: 14,
              top: insets.top + anchorTop,
              maxHeight: 480,
              backgroundColor: t.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: t.border,
              overflow: 'hidden',
            },
            shadowLg,
          ]}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: t.border,
            }}
          >
            <Text
              style={{
                fontSize: 10.5,
                fontFamily: type.familyBold,
                color: t.inkSoft,
                letterSpacing: 0.7,
                textTransform: 'uppercase',
              }}
            >
              {tx('daily.pickFarm')}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: type.familyNumBold,
                color: t.inkSoft,
              }}
            >
              {tx('daily.farmCount', { count: farms.length })}
            </Text>
          </View>

          {/* List */}
          <ScrollView delaysContentTouches={false} style={{ paddingVertical: 4 }}>
            {farms.map((f) => {
              const letter = avatarLetter(f.name);
              return (
                <Tappable
                  key={f.id}
                  feedback="opacity"
                  onPress={() => onSelect(f.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: f.selected }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                    backgroundColor: f.selected ? VIBRANT_BRAND[50] : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      backgroundColor: VIBRANT_BRAND[600],
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#fff',
                        fontFamily: type.familyBold,
                      }}
                    >
                      {letter}
                    </Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: type.familyBold,
                        color: t.ink,
                        letterSpacing: 0.1,
                        lineHeight: 18,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {f.name}
                    </Text>
                    <View
                      style={{
                        marginTop: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontFamily: type.familyNumBold,
                          color: t.inkSoft,
                        }}
                      >
                        {tx('daily.pondCount', { count: f.pondCount })}
                      </Text>
                      {f.dirtyCount > 0 ? (
                        <>
                          <View
                            style={{
                              width: 3,
                              height: 3,
                              borderRadius: 999,
                              backgroundColor: t.border,
                            }}
                          />
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <View
                              style={{
                                width: 5,
                                height: 5,
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
                              <Text style={{ fontFamily: type.familyNumBold }}>
                                {f.dirtyCount}
                              </Text>{' '}
                              {tx('daily.notLoggedShort')}
                            </Text>
                          </View>
                        </>
                      ) : null}
                    </View>
                  </View>

                  {f.selected ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        backgroundColor: VIBRANT_BRAND[600],
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon.check size={13} color="#fff" />
                    </View>
                  ) : null}
                </Tappable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
