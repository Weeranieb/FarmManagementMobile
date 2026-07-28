import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { VIBRANT_BRAND } from '../constants';

type Source = 'month' | 'date' | 'back' | 'farm';

type Props = {
  visible: boolean;
  dirtyCount: number;
  source: Source;
  /** Counter word for `dirtyCount` — "บ่อ" (ponds) for the farm daily-log,
   *  "วัน" (days) for the single-pond ledger. */
  unit?: string;
  error?: string | null;
  onDismiss: () => void;
  onDiscard: () => void;
  onSaveAndExit: () => void;
};

/** i18next keys for "if you …" — resolved in the component. */
const SOURCE_COPY: Record<Source, string> = {
  month: 'daily.leave.onChangeMonth',
  date: 'daily.leave.onChangeDay',
  back: 'daily.leave.onLeave',
  farm: 'daily.leave.onChangeFarm',
};

export function UnsavedChangesDialog({
  visible,
  dirtyCount,
  source,
  unit,
  error,
  onDismiss,
  onDiscard,
  onSaveAndExit,
}: Props) {
  const { t, shadowLg } = useTheme();
  const { t: tx } = useTranslation();
  const unitText = unit ?? tx('daily.pondCol');

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
          entering={FadeIn.duration(150)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(11,18,32,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
        >
          <Pressable
            onPress={onDismiss}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            accessibilityRole="button"
            accessibilityLabel={tx('common.close')}
          />

          <Animated.View
            entering={FadeIn.duration(160)}
            style={[
              {
                width: '100%',
                maxWidth: 340,
                backgroundColor: t.surface,
                borderRadius: 22,
                overflow: 'hidden',
                // Nudge above true center so the dialog sits in the
                // user's natural focal zone rather than dead-middle.
                transform: [{ translateY: -56 }],
              },
              shadowLg,
            ]}
          >
            {/* Header — icon + title + body */}
            <View
              style={{
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: t.warnSoft,
                  borderWidth: 1,
                  borderColor: t.warnSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.warn size={20} color={t.warn} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: type.familyBold,
                    color: t.ink,
                    lineHeight: 22,
                  }}
                >
                  {tx('daily.unsaved.title')}
                </Text>
                <Text
                  style={{
                    fontSize: 12.5,
                    color: t.inkSoft,
                    marginTop: 4,
                    lineHeight: 19,
                  }}
                >
                  {tx('daily.unsaved.body1')}{' '}
                  <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>{dirtyCount}</Text>{' '}
                  {tx('daily.unsaved.body2', {
                    unit: unitText,
                    when: tx(SOURCE_COPY[source]),
                  })}
                </Text>
              </View>
            </View>

            {/* Inline save error (frame L) */}
            {error ? (
              <View
                style={{
                  marginHorizontal: 14,
                  marginTop: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 11,
                  backgroundColor: t.dangerSoft,
                  borderWidth: 1,
                  borderColor: t.dangerSoft,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <View style={{ marginTop: 2 }}>
                  <Icon.alert size={14} color={t.danger} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 11.5,
                    color: t.danger,
                    lineHeight: 17,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Stacked actions */}
            <View
              style={{
                paddingHorizontal: 14,
                paddingTop: 14,
                paddingBottom: 16,
                gap: 8,
              }}
            >
              <Tappable
                onPress={onDiscard}
                style={{
                  height: 48,
                  borderRadius: 13,
                  backgroundColor: t.danger,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                accessibilityRole="button"
              >
                <Icon.trash size={16} color="#fff" />
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 14.5,
                    fontFamily: type.familyBold,
                  }}
                >
                  {tx('daily.unsaved.leaveNoSave')}
                </Text>
              </Tappable>

              <Tappable
                onPress={onSaveAndExit}
                style={{
                  height: 48,
                  borderRadius: 13,
                  backgroundColor: VIBRANT_BRAND[600],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                accessibilityRole="button"
              >
                <Icon.check size={16} color="#fff" />
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 14.5,
                    fontFamily: type.familyBold,
                  }}
                >
                  {tx('daily.unsaved.saveThenLeave')}{' '}
                  <Text style={{ fontFamily: type.familyNumBold }}>{dirtyCount}</Text> {unitText}{' '}
                  {tx('daily.unsaved.thenLeave')}
                </Text>
              </Tappable>

              <Tappable
                onPress={onDismiss}
                style={{
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: t.surface,
                  borderWidth: 1,
                  borderColor: t.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color: t.inkSoft,
                    fontSize: 14,
                    fontFamily: type.familyBold,
                  }}
                >
                  {tx('common.cancel')}
                </Text>
              </Tappable>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}
