import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Pill } from '@/components/ui';
import { Icon, type IconName } from '@/components/icons';
import { HomeScreen } from '@/screens/home';
import { FarmsScreen } from '@/screens/farms';
import { FarmPondsScreen } from '@/screens/farm-ponds';
import { ProfileScreen } from '@/screens/profile';
import { PondDetailScreen } from '@/screens/pond-detail';
import { DailyLogScreen } from '@/screens/daily-log';
import { usePondData, usePondsData } from '@/features/pond';
import { fmt } from '@/utils/fmt';

type Pane = 'home' | 'farms' | 'profile';

export function TabletLayout() {
  const { t } = useTheme();
  const router = useRouter();
  const [pane, setPane] = useState<Pane>('home');
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [detailMode, setDetailMode] = useState<'pond' | 'daily'>('pond');

  const { data: homePonds } = usePondsData();
  const { data: selectedPond } = usePondData(selectedPondId ?? undefined);
  const drillFarmId = selectedFarmId ?? selectedPond?.farmId;

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
              ponds={homePonds}
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
          {selectedPondId != null && pane === 'home' && detailMode === 'pond' ? (
            <PondDetailScreen
              pondId={selectedPondId}
              showHeader
              onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${selectedPondId}`)}
              onOpenDailyLog={() => setDetailMode('daily')}
            />
          ) : selectedPondId != null && pane === 'home' && detailMode === 'daily' ? (
            <DailyLogScreen
              farmId={drillFarmId ?? undefined}
              initialPondId={selectedPondId}
              onBack={() => setDetailMode('pond')}
            />
          ) : selectedPondId != null && pane === 'farms' && detailMode === 'pond' ? (
            <PondDetailScreen
              pondId={selectedPondId}
              showHeader
              onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${selectedPondId}`)}
              onOpenDailyLog={() => setDetailMode('daily')}
            />
          ) : selectedPondId != null && pane === 'farms' && detailMode === 'daily' ? (
            <DailyLogScreen
              farmId={drillFarmId ?? undefined}
              initialPondId={selectedPondId}
              onBack={() => setDetailMode('pond')}
            />
          ) : (
            <HomeScreen />
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
  ponds,
  selectedId,
  onSelect,
}: {
  ponds: ReturnType<typeof usePondsData>['data'];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const { t } = useTheme();
  const list = useMemo(() => ponds.filter((p) => p.status === 'active'), [ponds]);
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
        {list.length === 0 ? (
          <Text style={{ fontSize: 13, color: t.inkMute, fontFamily: type.family, padding: 12 }}>
            ไม่มีบ่อ — ลองรีเฟรชหรือเข้าสู่ระบบใหม่
          </Text>
        ) : (
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
                      backgroundColor: p.loggedToday
                        ? t.success
                        : p.lateDays > 0
                          ? t.danger
                          : t.warn,
                    }}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>
                        {p.name}
                      </Text>
                      {p.farmName ? (
                        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
                          · {p.farmName}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>
                      {fmt.num(p.totalFish)} ตัว
                      {p.ageDays != null ? ` · อายุ ${p.ageDays} วัน` : ''}
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
        )}
      </View>
    </View>
  );
}
