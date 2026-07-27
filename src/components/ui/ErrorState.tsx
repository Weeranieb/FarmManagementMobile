import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/icons';
import { useIsOnline } from '@/lib/network';
import { useTheme } from '@/theme/ThemeProvider';
import { dangerInk } from '@/theme/ink';
import { radii, space, type } from '@/theme/tokens';
import { Tappable } from './Tappable';

type Props = {
  /** Defaults to the generic "couldn't load" copy. */
  title?: string;
  help?: string;
  /** Omit to render without a retry button (e.g. inside a boundary that
   *  reloads by other means). */
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * The screen-level "this didn't load" block — the design's `ScreenError`.
 *
 * Read screens used to swallow `isError` and render their empty state instead,
 * so a failed fetch looked exactly like "this farm has no ponds" with no way
 * back. Distinguishing the two is the whole point: an empty state invites the
 * next action, an error state offers a retry.
 *
 * When the device is offline it says so instead of blaming the request — the
 * data will come back on its own once React Query resumes (src/lib/network.ts).
 */
export function ErrorState({ title, help, onRetry, retryLabel }: Props) {
  const { t, mode } = useTheme();
  const { t: tx } = useTranslation();
  const online = useIsOnline();
  const ink = dangerInk(mode, t);

  return (
    <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: space[7], gap: 12 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.lg,
          backgroundColor: online ? t.dangerSoft : t.warnSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.alert size={28} color={online ? ink : t.warn} />
      </View>
      <Text
        style={{
          fontSize: 17,
          fontFamily: type.familyBold,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {title ?? tx('error.loadTitle')}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.family,
          color: t.inkMute,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {help ?? (online ? tx('error.loadHelp') : tx('error.offlineHelp'))}
      </Text>
      {onRetry ? (
        <Tappable
          onPress={onRetry}
          accessibilityRole="button"
          style={{
            marginTop: space[2],
            height: 48,
            paddingHorizontal: space[6],
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: t.borderStrong,
            backgroundColor: t.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon.cycle size={16} color={t.ink} />
          <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>
            {retryLabel ?? tx('error.retry')}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}
