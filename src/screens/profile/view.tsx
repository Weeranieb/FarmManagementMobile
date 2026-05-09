import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii, type ThemeMode } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { LanguageSheet, type LanguageCode } from '@/screens/language';
import { ListRow } from './components/ListRow';

type Props = {
  showHeader?: boolean;
  profileName: string;
  handleLogout: () => void;
  openAccount: () => void;
  openLanguage: () => void;
  closeLanguage: () => void;
  showLanguageSheet: boolean;
  language: LanguageCode;
  handlePickLanguage: (code: LanguageCode) => void;
};

export function ProfileView({
  showHeader = true,
  profileName,
  handleLogout,
  openAccount,
  openLanguage,
  closeLanguage,
  showLanguageSheet,
  language,
  handlePickLanguage,
}: Props) {
  const { t: tx } = useTranslation();
  const { t, mode, setMode } = useTheme();

  const langLabel = language === 'en' ? tx('profile.language.en') : tx('profile.language.th');

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title={tx('profile.title')} /> : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ padding: 20, alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: t.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: t.brandInk, fontSize: 36, fontFamily: type.familyBold }}>
              {profileName.slice(0, 1)}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontFamily: type.familyBold, color: t.ink }}>
            {profileName}
          </Text>
          <Text style={{ fontSize: 13, color: t.inkSoft, fontFamily: type.family }}>
            เจ้าของฟาร์ม · ฟาร์ม FarmOS 1
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: type.familyBold,
              color: t.inkSoft,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {tx('profile.displayMode')}
          </Text>
          <Card padded={false}>
            <Row gap={0} style={{ padding: 4 }}>
              {(
                [
                  { id: 'light', label: 'สว่าง' },
                  { id: 'dark', label: 'มืด' },
                  { id: 'outdoor', label: 'แดดจัด' },
                ] as { id: ThemeMode; label: string }[]
              ).map((opt) => {
                const sel = mode === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setMode(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: radii.sm,
                      backgroundColor: sel ? t.brandSoft : 'transparent',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: sel ? t.brandInk : t.inkSoft,
                        fontFamily: sel ? type.familySemi : type.family,
                        fontSize: 14,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </Row>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Card padded={false}>
            <ListRow icon="user" label={tx('profile.rowAccount')} onPress={openAccount} />
            <ListRow
              icon="globe"
              label={tx('profile.rowLanguage')}
              trailing={langLabel}
              onPress={openLanguage}
            />
            <ListRow icon="doc" label={tx('profile.rowAbout')} trailing="v0.1.0" last />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              paddingVertical: 14,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.danger + '55',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Row gap={8}>
              <Icon.logout size={16} color={t.danger} />
              <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 14 }}>
                {tx('profile.logout')}
              </Text>
            </Row>
          </Pressable>
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
