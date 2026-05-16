import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useTheme } from '@/theme/ThemeProvider';
import { type, type ThemeMode } from '@/theme/tokens';
import { Card, Pill, TopBar } from '@/components/ui';
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
  openFeedCollection: () => void;
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
        fontSize: 12,
        fontFamily: type.familyBold,
        color: t.inkSoft,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

export function ProfileView({
  showHeader = true,
  firstName,
  lastName,
  username,
  handleLogout,
  openAccount,
  openFeedCollection,
  openLanguage,
  closeLanguage,
  showLanguageSheet,
  language,
  handlePickLanguage,
}: Props) {
  const { t: tx } = useTranslation();
  const { t, mode, setMode } = useTheme();

  const langLabel = language === 'en' ? tx('profile.language.en') : tx('profile.language.th');
  const modeLabel = tx(`profile.modes.${mode}`);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const initial = (firstName?.[0] ?? username?.[0] ?? '–').toUpperCase();

  const cycleMode = () => {
    const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length] ?? 'light';
    setMode(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title={tx('profile.title')} /> : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 }}>
          <Card style={{ paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: t.brandSoft,
                  borderWidth: 2,
                  borderColor: t.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: t.brandInk, fontFamily: type.familyBold, fontSize: 18 }}>
                  {initial}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontFamily: type.familyBold, fontSize: 16, color: t.ink }}
                  numberOfLines={1}
                >
                  {fullName || firstName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Pill tone="brand">{tx('profile.ownerLabel')}</Pill>
                  <Text
                    style={{
                      fontSize: 12,
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
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Card padded={false}>
            <ListRow icon="user" label={tx('profile.rowAccount')} onPress={openAccount} />
            <ListRow
              icon="feed"
              label={tx('profile.rowFeedCollection')}
              onPress={openFeedCollection}
            />
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
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Card padded={false}>
            <ListRow
              icon="refresh"
              label={tx('profile.rowTheme')}
              sub={tx('profile.themeNow', { mode: modeLabel })}
              onPress={cycleMode}
            />
            <ListRow
              icon="logout"
              label={tx('profile.logout')}
              tone="danger"
              onPress={handleLogout}
              last
            />
          </Card>
        </View>
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
