import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Pill } from '@/components/ui';
import { Icon, type IconName } from '@/components/icons';
import { HomeScreen } from '@/screens/home';
import { FarmsScreen } from '@/screens/FarmsScreen';
import { FarmPondsScreen } from '@/screens/FarmPondsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { PondDetailScreen } from '@/screens/PondDetailScreen';
import { DailyLogScreen } from '@/screens/DailyLogScreen';
import { ponds } from '@/mock/data';
import { fmt } from '@/utils/fmt';

type Pane = 'home' | 'farms' | 'profile';

export function TabletLayout() {
  const { t } = useTheme();
  const router = useRouter();
  const [pane, setPane] = useState<Pane>('home');
  const [selectedPondId, setSelectedPondId] = useState<number>(14);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [detailMode, setDetailMode] = useState<'pond' | 'daily'>('pond');

  return (
    <ThemedSafeAreaView edges={['top', 'bottom']}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <NavRail
          active={pane}
          onChange={(p) => {
            setPane(p);
            setDetailMode('pond');
            setSelectedFarmId(null);
          }}
        />

        <View style={{ width: 380, borderRightWidth: 1, borderRightColor: t.border }}>
          {pane === 'home' ? (
            <PondMaster
              selectedId={selectedPondId}
              onSelect={(id) => {
                setSelectedPondId(id);
                setDetailMode('pond');
              }}
            />
          ) : pane === 'farms' && selectedFarmId == null ? (
            <FarmsScreen
              onOpenFarm={(id) => {
                setSelectedFarmId(id);
                setDetailMode('pond');
                setSelectedPondId((prev) => {
                  const inFarm = ponds.filter((p) => p.farmId === id);
                  if (inFarm.some((p) => p.id === prev)) return prev;
                  return inFarm[0]?.id ?? prev;
                });
              }}
            />
          ) : pane === 'farms' && selectedFarmId != null ? (
            <FarmPondsScreen
              farmId={selectedFarmId}
              onBack={() => setSelectedFarmId(null)}
              onOpenPond={(pondId) => {
                setSelectedPondId(pondId);
                setDetailMode('pond');
              }}
            />
          ) : (
            <ProfileScreen />
          )}
        </View>

        <View style={{ flex: 1 }}>
          {pane === 'home' && detailMode === 'pond' ? (
            <PondDetailScreen
              pondId={selectedPondId}
              showHeader
              onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${selectedPondId}`)}
              onOpenDailyLog={() => setDetailMode('daily')}
            />
          ) : pane === 'home' && detailMode === 'daily' ? (
            <DailyLogScreen
              pondId={selectedPondId}
              showHeader
              onBack={() => setDetailMode('pond')}
            />
          ) : pane === 'farms' && detailMode === 'pond' ? (
            <PondDetailScreen
              pondId={selectedPondId}
              showHeader
              onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${selectedPondId}`)}
              onOpenDailyLog={() => setDetailMode('daily')}
            />
          ) : pane === 'farms' && detailMode === 'daily' ? (
            <DailyLogScreen
              pondId={selectedPondId}
              showHeader
              onBack={() => setDetailMode('pond')}
            />
          ) : (
            <HomeScreen showHeader={false} />
          )}
        </View>
      </View>
    </ThemedSafeAreaView>
  );
}

function NavRail({ active, onChange }: { active: Pane; onChange: (p: Pane) => void }) {
  const { t } = useTheme();
  const items: { id: Pane; icon: IconName }[] = [
    { id: 'home', icon: 'home' },
    { id: 'farms', icon: 'farm' },
    { id: 'profile', icon: 'user' },
  ];
  return (
    <View
      style={{
        width: 76,
        backgroundColor: t.surface,
        borderRightWidth: 1,
        borderRightColor: t.border,
        alignItems: 'center',
        paddingVertical: 18,
        gap: 18,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.md,
          backgroundColor: t.brand,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 18 }}>F</Text>
      </View>
      <View style={{ gap: 6, alignItems: 'center' }}>
        {items.map((item) => {
          const Ico = Icon[item.icon];
          const sel = active === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: sel ? t.brandSoft : 'transparent',
              }}
            >
              <Ico size={22} stroke={sel ? 2 : 1.6} color={sel ? t.brand : t.inkMute} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PondMaster({
  selectedId,
  onSelect,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const { t } = useTheme();
  const list = ponds.filter((p) => p.status === 'active');
  const pending = list.filter((p) => !p.loggedToday);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 12, gap: 8 }}>
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>วันนี้</Text>
        <Text style={{ fontSize: 22, fontFamily: type.familyBold, color: t.ink }}>บ่อใช้งาน</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pill tone="warn">รอบันทึก {pending.length}</Pill>
          <Pill tone="success">เสร็จแล้ว {list.length - pending.length}</Pill>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 14, paddingBottom: 14 }}>
        <View style={{ gap: 6 }}>
          {list.map((p) => {
            const sel = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => onSelect(p.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: radii.md,
                  backgroundColor: sel ? t.brandSoft : 'transparent',
                  borderWidth: 1,
                  borderColor: sel ? t.brand : 'transparent',
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: p.loggedToday ? t.success : p.lateDays > 0 ? t.danger : t.warn,
                  }}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
                      · {p.farmName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>
                    {fmt.num(p.totalFish)} ตัว · อายุ {p.ageDays} วัน
                  </Text>
                </View>
                {p.loggedToday ? (
                  <Icon.check size={14} color={t.success} />
                ) : (
                  <Icon.chevR size={14} color={t.inkMute} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
