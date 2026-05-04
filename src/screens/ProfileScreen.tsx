import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon, type IconName } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { useAuthStore } from '@/store/auth';
import { user } from '@/mock/data';
import type { ThemeMode } from '@/theme/tokens';

type Props = { showHeader?: boolean };

export function ProfileScreen({ showHeader = true }: Props) {
  const { t, mode, setMode } = useTheme();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clear);
  const profileName = useAuthStore((s) => s.user?.firstName) ?? user.name;

  const handleLogout = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title="โปรไฟล์" /> : null}
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
            โหมดแสดงผล
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
            <ListRow icon="user" label="ข้อมูลบัญชี" />
            <ListRow icon="globe" label="ภาษา" trailing="ไทย" />
            <ListRow icon="doc" label="เกี่ยวกับ" trailing="v0.1.0" last />
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
                ออกจากระบบ
              </Text>
            </Row>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ListRow({
  icon,
  label,
  trailing,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  trailing?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  const Ico = Icon[icon];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <Ico size={18} color={t.inkSoft} />
      <Text style={{ flex: 1, fontSize: 14, color: t.ink, fontFamily: type.family }}>{label}</Text>
      {trailing ? (
        <Text style={{ color: t.inkSoft, fontSize: 13, fontFamily: type.family }}>{trailing}</Text>
      ) : null}
      <Icon.chevR size={16} color={t.inkSoft} />
    </Pressable>
  );
}
