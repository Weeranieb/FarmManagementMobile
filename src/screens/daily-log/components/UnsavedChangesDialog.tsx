import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
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

const SOURCE_COPY: Record<Source, string> = {
  month: 'หากเปลี่ยนเดือน',
  date: 'หากเปลี่ยนวัน',
  back: 'หากออกจากหน้านี้',
  farm: 'หากเปลี่ยนฟาร์ม',
};

export function UnsavedChangesDialog({
  visible,
  dirtyCount,
  source,
  unit = 'บ่อ',
  error,
  onDismiss,
  onDiscard,
  onSaveAndExit,
}: Props) {
  const { t, shadowLg } = useTheme();

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
            accessibilityLabel="ปิด"
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
                  ยังไม่ได้บันทึกข้อมูล
                </Text>
                <Text
                  style={{
                    fontSize: 12.5,
                    color: t.inkSoft,
                    marginTop: 4,
                    lineHeight: 19,
                  }}
                >
                  คุณมีข้อมูล{' '}
                  <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>{dirtyCount}</Text>{' '}
                  {unit}ที่ยังไม่ได้บันทึก {SOURCE_COPY[source]} ข้อมูลจะหายไป
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
              <Pressable
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
                  ออกโดยไม่บันทึก
                </Text>
              </Pressable>

              <Pressable
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
                  บันทึก <Text style={{ fontFamily: type.familyNumBold }}>{dirtyCount}</Text> {unit}
                  แล้วออก
                </Text>
              </Pressable>

              <Pressable
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
                  ยกเลิก
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}
