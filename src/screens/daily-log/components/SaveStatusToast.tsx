import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

export type SaveToastStatus = 'saving' | 'success' | 'error';

type Props = {
  status: SaveToastStatus;
  /** # of days being saved — shown in the success copy. */
  days: number;
  /** # of ponds that failed — shown in the error copy. */
  failedCount?: number;
  /** Specific error detail (e.g. a server/validation message) shown as the
   *  error subtitle in place of the generic "ลองอีกครั้ง" when provided. */
  message?: string;
  /** ms before the success toast auto-dismisses. Default 4000. */
  successDuration?: number;
  /** Bottom offset (safe-area inset). */
  bottom?: number;
  onRetry?: () => void;
  onDismiss: () => void;
};

/**
 * Non-blocking save-status toast for the daily-log screen. Confirming the
 * month save closes the sheet immediately and mounts this pill, which reports
 * the server round-trip: `saving…` → `success` / `error`. Success auto-
 * dismisses; error persists with a "ลองใหม่" action. Visual chrome matches the
 * home SavedToast (dark pill + chip + fade/slide-up entrance).
 */
export function SaveStatusToast({
  status,
  days,
  failedCount = 0,
  message,
  successDuration = 4000,
  bottom = 0,
  onRetry,
  onDismiss,
}: Props) {
  const { t } = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // Only the success state auto-dismisses; saving waits for the server and
  // error waits for the user (retry / close).
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => onDismiss(), successDuration);
    return () => clearTimeout(timer);
  }, [status, successDuration, onDismiss]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  const isError = status === 'error';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: space[4],
        right: space[4],
        bottom: bottom + 18,
        opacity: enter,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: t.ink,
          borderRadius: radii.md - 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: space[3],
          paddingVertical: space[2] + 2,
        }}
      >
        {/* Status chip */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isError ? t.danger : 'rgba(255,255,255,0.14)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {status === 'saving' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : status === 'success' ? (
            <Icon.check size={14} color="#fff" stroke={2.4} />
          ) : (
            <Icon.alert size={14} color="#fff" />
          )}
        </View>

        {/* Copy */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: '#fff',
              fontSize: type.sizes.sm,
              fontFamily: type.familySemi,
              lineHeight: 16,
            }}
          >
            {status === 'saving'
              ? 'กำลังบันทึก…'
              : status === 'success'
                ? `บันทึกแล้ว ${days} วัน`
                : 'บันทึกไม่สำเร็จ'}
          </Text>
          {status === 'saving' ? (
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: type.sizes.xs,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              รอเซิร์ฟเวอร์ตอบกลับ
            </Text>
          ) : isError ? (
            <Text
              numberOfLines={2}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: type.sizes.xs,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {message ?? (failedCount > 0 ? `${failedCount} บ่อยังไม่ถูกบันทึก` : 'ลองอีกครั้ง')}
            </Text>
          ) : null}
        </View>

        {/* Error actions — retry + dismiss */}
        {isError ? (
          <>
            <Tappable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="ลองใหม่"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.16)',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#fff', fontSize: type.sizes.sm, fontFamily: type.familySemi }}>
                ลองใหม่
              </Text>
            </Tappable>
            <Tappable
              onPress={onDismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="ปิด"
              style={{ flexShrink: 0, padding: 2 }}
            >
              <Icon.x size={16} color="rgba(255,255,255,0.7)" />
            </Tappable>
          </>
        ) : null}
      </View>
    </Animated.View>
  );
}
