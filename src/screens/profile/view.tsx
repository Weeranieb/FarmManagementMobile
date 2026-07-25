import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type, type ThemeMode } from '@/theme/tokens';
import { dangerInk } from '@/theme/ink';
import { Card, Pill, TopBar, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { LanguageSheet, type LanguageCode } from '@/screens/language';
import { ListRow } from './components/ListRow';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

type Props = {
  showHeader?: boolean;
  firstName: string;
  lastName: string;
  username: string;
  handleLogout: () => void;
  openAccount: () => void;
  openLanguage: () => void;
  closeLanguage: () => void;
  showLanguageSheet: boolean;
  language: LanguageCode;
  handlePickLanguage: (code: LanguageCode) => void;
};

const MODE_ORDER: ThemeMode[] = ['light', 'dark', 'outdoor'];

function SectionLabel({ children }: { children: string }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: type.sizes.sm,
        fontFamily: type.familyBold,
        color: t.inkSoft,
        paddingHorizontal: space[5],
        paddingTop: space[5],
        paddingBottom: space[2],
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Segmented display-mode switch. Replaces the blind "cycle" row so all three
 * themes — including the outdoor (sunlight) mode — are visible and one tap away.
 */
function ModeSwitch() {
  const { t, mode, setMode, shadow } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space[1],
        padding: space[1],
        borderRadius: radii.md,
        backgroundColor: t.surfaceSunk,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      {MODE_ORDER.map((m) => {
        const active = m === mode;
        return (
          <Tappable
            key={m}
            feedback="opacity"
            onPress={() => setMode(m)}
            android_ripple={{ color: t.surfaceAlt }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[2] - 2,
              minHeight: 44,
              paddingVertical: space[2],
              borderRadius: radii.sm,
              backgroundColor: active ? t.surface : 'transparent',
              borderWidth: 1,
              borderColor: active ? t.borderStrong : 'transparent',
              ...(active ? shadow : null),
            }}
          >
            {m === 'outdoor' ? (
              <Icon.sun size={15} color={active ? t.brand : t.inkMute} />
            ) : null}
            <Text
              style={{
                fontSize: type.sizes.sm,
                fontFamily: active ? type.familySemi : type.familyMedium,
                color: active ? t.ink : t.inkMute,
              }}
            >
              {tx(`profile.modes.${m}`)}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

export function ProfileView({
  showHeader = true,
  firstName,
  lastName,
  username,
  handleLogout,
  openAccount,
  openLanguage,
  closeLanguage,
  showLanguageSheet,
  language,
  handlePickLanguage,
}: Props) {
  const { t: tx } = useTranslation();
  const { t, mode } = useTheme();

  const langLabel = language === 'en' ? tx('profile.language.en') : tx('profile.language.th');
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const initial = (firstName?.[0] ?? username?.[0] ?? '–').toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title={tx('profile.title')} /> : null}
      <ScrollView delaysContentTouches={false} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Identity — the one focal moment on the screen */}
        <View style={{ paddingHorizontal: space[5], paddingTop: space[5], paddingBottom: space[1] }}>
          <Card style={{ paddingVertical: space[5] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: t.brandSoft,
                  borderWidth: 2,
                  borderColor: t.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: t.brandInk, fontFamily: type.familyBold, fontSize: type.sizes.xxl }}>
                  {initial}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontFamily: type.familyBold, fontSize: type.sizes.xl, color: t.ink }}
                  numberOfLines={1}
                >
                  {fullName || firstName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[2] }}>
                  <Pill tone="brand">{tx('profile.ownerLabel')}</Pill>
                  <Text
                    style={{
                      fontSize: type.sizes.sm,
                      color: t.inkMute,
                      fontFamily: type.familyNum,
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                  >
                    {username}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        <SectionLabel>{tx('profile.settings')}</SectionLabel>
        <View style={{ paddingHorizontal: 20 }}>
          <Card padded={false}>
            <ListRow icon="user" label={tx('profile.rowAccount')} onPress={openAccount} />
            <ListRow
              icon="globe"
              label={tx('profile.rowLanguage')}
              trailing={langLabel}
              onPress={openLanguage}
            />
            <ListRow icon="doc" label={tx('profile.rowAbout')} trailing={`v${APP_VERSION}`} last />
          </Card>
        </View>

        <SectionLabel>{tx('profile.displayMode')}</SectionLabel>
        <View style={{ paddingHorizontal: 20 }}>
          <ModeSwitch />
        </View>

        {/* Destructive action — separated and clearly weighted, not a settings row */}
        <Tappable
          onPress={handleLogout}
          android_ripple={{ color: t.dangerSoft }}
          style={{
            marginHorizontal: space[5],
            marginTop: space[7],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space[2],
            paddingVertical: space[4],
            borderRadius: radii.lg,
            backgroundColor: t.dangerSoft,
          }}
        >
          <Icon.logout size={18} color={dangerInk(mode, t)} />
          <Text style={{ fontFamily: type.familySemi, fontSize: type.sizes.base, color: dangerInk(mode, t) }}>
            {tx('profile.logout')}
          </Text>
        </Tappable>
      </ScrollView>

      <LanguageSheet
        visible={showLanguageSheet}
        selected={language}
        onPick={handlePickLanguage}
        onClose={closeLanguage}
      />
    </View>
  );
}
