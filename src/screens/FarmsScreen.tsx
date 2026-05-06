import { useCallback, useMemo, useState } from 'react';
import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import type { FarmMock } from '@/mock/data';
import type { FarmResponse } from '@/api/types';
import { pondsApi } from '@/api/ponds';
import { qk, useFarms } from '@/api/queries';
import { useAuthStore } from '@/store/auth';
import { useFarmsData } from '@/data';
import { thaiDate } from '@/locale/thaiDate';

type Props = {
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
};

function farmAddedSubtitle(iso?: string): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `เพิ่มเมื่อ ${thaiDate.monthYearShort(d)}`;
}

export function FarmsScreen({ showHeader = true, onOpenFarm }: Props) {
  const { t } = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data: farmsRaw } = useFarmsData();
  const farmsQuery = useFarms();
  const hasToken = useAuthStore((s) => s.token != null);
  /** Only merge `/pond` rollups when the farm list actually came back from API (not mock fallback). */
  const useLivePondRollup = hasToken && farmsQuery.isSuccess && Array.isArray(farmsQuery.data);

  const baseline = Array.isArray(farmsRaw) ? farmsRaw : [];

  const pondQueries = useQueries({
    queries: useLivePondRollup
      ? baseline.map((f) => ({
          queryKey: qk.ponds(f.id),
          queryFn: () => pondsApi.list(f.id),
          enabled: useLivePondRollup,
          staleTime: 60_000,
        }))
      : [],
  });

  const farms = useMemo(() => {
    if (!useLivePondRollup) return baseline;

    return baseline.map((f, idx) => {
      const ponds = pondQueries[idx]?.data;
      if (!Array.isArray(ponds)) {
        return f;
      }

      let totalStock = 0;
      let activeFromPonds = 0;
      for (const p of ponds) {
        if (p.status === 'active') activeFromPonds++;
        totalStock += p.totalFish ?? 0;
      }

      return {
        ...f,
        activePonds: activeFromPonds,
        totalStock,
      };
    });
  }, [baseline, pondQueries, useLivePondRollup]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: qk.farms() });
      const farmsList = queryClient.getQueryData<FarmResponse[]>(qk.farms());
      if (Array.isArray(farmsList) && farmsList.length > 0) {
        await Promise.all(
          farmsList.map((f) => queryClient.refetchQueries({ queryKey: qk.ponds(f.id) })),
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title="ฟาร์มของฉัน" subtitle={`${farms.length} ฟาร์ม`} /> : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.brand}
            {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
          />
        }
      >
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View
            style={{
              height: 48,
              borderRadius: radii.md,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: t.border,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Icon.search size={18} color={t.inkSoft} />
            <Text style={{ color: t.inkMute, fontSize: 14, fontFamily: type.family }}>
              ค้นหาฟาร์ม
            </Text>
          </View>
        </View>

        <Col gap={12} style={{ paddingHorizontal: 20 }}>
          {farms.map((fm) => (
            <FarmCard
              key={fm.id}
              farm={fm}
              subtitle={farmAddedSubtitle(fm.createdAt)}
              onPress={() => onOpenFarm?.(fm.id)}
            />
          ))}
        </Col>
      </ScrollView>
    </View>
  );
}

function FarmCard({
  farm,
  subtitle,
  onPress,
}: {
  farm: FarmMock;
  subtitle?: string | null;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <Col gap={2}>
            <Text style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink }}>
              ฟาร์ม {farm.name}
            </Text>
            {subtitle ? (
              <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                {subtitle}
              </Text>
            ) : null}
          </Col>
          <Icon.chevR size={18} color={t.inkSoft} />
        </Row>
        <Row gap={0} style={{ borderTopWidth: 1, borderTopColor: t.border, paddingTop: 10 }}>
          <Stat label="บ่อทั้งหมด" v={String(farm.pondCount)} />
          <Divider />
          <Stat label="ใช้งาน" v={String(farm.activePonds)} accent={t.statusActive} />
          <Divider />
          <Stat label="ปลารวม" v={fmt.num(farm.totalStock)} sub="ตัว" />
        </Row>
      </View>
    </Card>
  );
}

function Stat({
  label,
  v,
  sub,
  accent,
}: {
  label: string;
  v: string;
  sub?: string;
  accent?: string;
}) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 18,
            color: accent ?? t.ink,
          }}
        >
          {v}
        </Text>
        {sub ? (
          <Text
            style={{ fontSize: 11, color: t.inkMute, marginLeft: 3, fontFamily: type.familyMedium }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
    </View>
  );
}

function Divider() {
  const { t } = useTheme();
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}
