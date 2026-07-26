import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { warnInk } from '@/theme/ink';
import { space, type } from '@/theme/tokens';
import { useIsOnline } from '@/lib/network';

/**
 * App-wide offline strip, mounted once in the root layout.
 *
 * With `onlineManager` wired to the OS (src/lib/network.ts) React Query pauses
 * fetches while out of signal instead of failing them — quiet and correct, but
 * indistinguishable from "this farm has no ponds" unless we say why. The strip
 * makes the state legible and explains that what's on screen is the last synced
 * copy, which is exactly what the persisted query cache is serving.
 *
 * Sits at the BOTTOM of the root, below the screen (and its tab bar / save bar),
 * taking real layout space:
 *  · every route owns its own top inset (ThemedSafeAreaView / paddingTop), so a
 *    top strip would either double that inset or hide under the notch;
 *  · taking space instead of floating guarantees it never covers a row the user
 *    is reading or a control they're reaching for.
 */
export function OfflineBanner() {
  const online = useIsOnline();
  const { t, mode } = useTheme();
  const insets = useSafeAreaInsets();

  if (online) return null;

  const ink = warnInk(mode, t);

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="ออฟไลน์"
      style={{
        paddingTop: space[2],
        paddingBottom: space[2] + insets.bottom,
        paddingHorizontal: space[4],
        backgroundColor: t.warnSoft,
        borderTopWidth: 1,
        borderTopColor: t.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[2],
      }}
    >
      <Icon.warn size={14} color={ink} />
      <Text
        numberOfLines={1}
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familySemi,
          color: ink,
        }}
      >
        ออฟไลน์ — แสดงข้อมูลที่ซิงค์ไว้ล่าสุด
      </Text>
    </View>
  );
}
