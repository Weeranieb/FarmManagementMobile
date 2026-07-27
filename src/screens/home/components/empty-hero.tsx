import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

type Props = { onCreateFarm?: () => void };

/**
 * Empty state for a brand-new user with no farms yet. Replaces the daily-log
 * primary card; everything below it stays hidden until the user has at least
 * one farm with one pond.
 *
 * The create CTA is client-admin only — `POST /farm` requires that level
 * server-side, so a normal worker seeing this button would tap it and get
 * nowhere. They're told who can do it instead.
 */
export function EmptyHero({ onCreateFarm }: Props) {
  const { t, shadow } = useTheme();
  const { t: tx } = useTranslation();
  const canCreate = isClientAdmin(useAuthStore((s) => s.user));
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: radii.lg + 2,
          padding: space[5],
          alignItems: 'center',
        },
        shadow,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.lg,
          backgroundColor: t.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space[3] + 2,
        }}
      >
        <Icon.farm size={30} color={t.brandInk} />
      </View>
      <Text
        style={{
          fontSize: type.sizes.lg + 1,
          fontFamily: type.familyBold,
          color: t.ink,
          letterSpacing: -0.2,
          textAlign: 'center',
        }}
      >
        {tx('homeEmpty.title')}
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkSoft,
          marginTop: 6,
          lineHeight: 20,
          textAlign: 'center',
          paddingHorizontal: space[2],
          fontFamily: type.family,
        }}
      >
        {canCreate ? tx('homeEmpty.adminHelp') : tx('homeEmpty.workerHelp')}
      </Text>
      {/* Chrome on the View, static style on the Pressable — function styles
          on Pressable are dropped by react-native-css-interop (NativeWind). */}
      {canCreate ? (
        <View
          style={{
            marginTop: space[4],
            width: '100%',
            backgroundColor: t.brand,
            borderRadius: radii.md,
            overflow: 'hidden',
          }}
        >
          <Tappable
            onPress={onCreateFarm}
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
            style={{
              height: 52,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Icon.plus size={18} color="#fff" stroke={2.4} />
            <Text style={{ color: '#fff', fontSize: type.sizes.base, fontFamily: type.familyBold }}>
              {tx('farms.createFarm')}
            </Text>
          </Tappable>
        </View>
      ) : null}
    </View>
  );
}

export function EmptyTrailing() {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  // Same gate as the hero's CTA: the setup steps are only *this* user's to do
  // when they're a client admin.
  const canCreate = isClientAdmin(useAuthStore((s) => s.user));
  return (
    <View style={{ paddingHorizontal: space[6], paddingVertical: space[6] }}>
      <Text
        style={{
          fontSize: type.sizes.xs,
          color: t.inkMute,
          lineHeight: 18,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        {canCreate ? tx('homeEmpty.stepsAdmin') : tx('homeEmpty.stepsWorker')}
      </Text>
    </View>
  );
}
