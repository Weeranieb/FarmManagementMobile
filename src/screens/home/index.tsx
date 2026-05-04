import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii, space } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Skeleton, SkeletonShape } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
// Home-specific components are co-located under ./components per the
// "Consider a /screens folder" pattern in the Expo folder-structure guide.
import { StatCard } from './components/stat-card';
import { StatCardSkeleton } from './components/stat-card-skeleton';
import { AlertStripCard } from './components/alert-strip-card';
import { AlertStripCardSkeleton } from './components/alert-strip-card-skeleton';
import { AlertRow, type AlertItem } from './components/alert-row';
import { AlertRowSkeleton } from './components/alert-row-skeleton';
import { ActivityRow, type ActivityItem } from './components/activity-row';
import { ActivityRowSkeleton } from './components/activity-row-skeleton';
import { SectionHeading } from './components/section-heading';
import { thaiDate } from '@/locale/thaiDate';
import { today, user } from '@/mock/data';
import { useAuthStore } from '@/store/auth';

const HOME_SUMMARY = {
  fish: { value: '86,400', unit: 'ตัว', caption: '9 บ่อ' },
  active: { value: '9 / 13', unit: 'บ่อ', caption: 'ปิดบ่อ 4' },
  feed: { value: '฿4,250', unit: '', caption: 'จาก 3 บ่อ' },
  deaths: { value: '8', unit: 'ตัว', caption: 'ใน 2 บ่อ' },
};
const HOME_TASK = { pending: 6, total: 9, late: 2 };
const HOME_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    kind: 'danger',
    icon: 'alert',
    title: 'บ่อ A1 — ปลาตายสูงผิดปกติ',
    sub: 'เฉลี่ย 7 ตัว/วัน, สัปดาห์นี้ 23 ตัว',
  },
  {
    id: 'a2',
    kind: 'warn',
    icon: 'clock',
    title: 'บ่อ C5 — ไม่ได้บันทึก 2 วัน',
    sub: 'บันทึกล่าสุด 30 เม.ย. 2569',
  },
  {
    id: 'a3',
    kind: 'success',
    icon: 'check',
    title: 'บ่อ B2 — พร้อมจับ',
    sub: 'อายุ 165 วัน · ปลานิล',
  },
];
const HOME_ACTIVITY: ActivityItem[] = [
  {
    id: 'e1',
    kind: 'feed',
    when: '09:30',
    pond: 'บ่อ A1',
    text: 'บันทึกอาหาร 22.5 kg',
    by: 'สมชาย',
  },
  {
    id: 'e2',
    kind: 'sell',
    when: 'เมื่อวาน 16:00',
    pond: 'บ่อ B3',
    text: 'ขายปลา ฿45,200',
    by: 'คุณอรรถพล',
    extra: 'ผู้รับ ABC Wholesale',
  },
  {
    id: 'e3',
    kind: 'move',
    when: '2 วันก่อน',
    pond: 'บ่อ C2',
    text: 'ย้ายปลา 5,000 ตัว → บ่อ D1',
    by: 'สมชาย',
  },
  {
    id: 'e4',
    kind: 'fill',
    when: '3 วันก่อน',
    pond: 'บ่อ A4',
    text: 'เติมปลา ปลานิล 4,500 ตัว',
    by: 'คุณอรรถพล',
  },
  {
    id: 'e5',
    kind: 'feed',
    when: '3 วันก่อน',
    pond: 'บ่อ B1',
    text: 'บันทึกอาหาร 18.0 kg',
    by: 'สมชาย',
  },
];

const GRID_GAP = space[3]; // 12 px — keeps 8 pt grid

// Filter logs in dev: `npx react-native log-ios | grep \[Home\]`
const log = (...args: unknown[]) => console.log('[Home]', ...args);

type Props = {
  showHeader?: boolean;
  onOpenPond?: (pondId?: number) => void;
  /** Bottom scroll padding when FAB floats above tab bar (tab route only). */
  fabClearance?: number;
  /** When true, swap real cards for skeleton placeholders. Layout dimensions match,
   * so no shift occurs when data loads. */
  isLoading?: boolean;
};

export function HomeScreen({
  showHeader = true,
  onOpenPond,
  fabClearance,
  isLoading = false,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const fallbackName = user.name.split(' ')[0] ?? user.name;
  const greetingName = authUser?.firstName?.trim() || fallbackName;
  const displayInitial = greetingName.trim().slice(0, 1);

  const bottomPad = fabClearance ?? space[10] + space[8];

  useEffect(() => {
    log('HomeScreen mount', {
      isLoading,
      showHeader,
      fabClearance,
      authUser: authUser ? { id: authUser.id, firstName: authUser.firstName } : null,
      greetingName,
      counts: {
        alerts: HOME_ALERTS.length,
        activity: HOME_ACTIVITY.length,
        taskPending: HOME_TASK.pending,
        taskLate: HOME_TASK.late,
      },
    });
    return () => log('HomeScreen unmount');
    // Run once per mount + when loading flag flips so we can see state
    // transitions during dev (skeleton -> real data).
  }, [isLoading, showHeader, fabClearance, authUser, greetingName]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {showHeader ? (
        <View style={{ paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: 0 }}>
          <Text
            style={{
              fontSize: type.sizes.xs,
              color: t.inkMute,
              letterSpacing: 0.4,
              fontFamily: type.familyMedium,
            }}
          >
            {tx('app.name')}
          </Text>
        </View>
      ) : null}

      <View
        style={{ paddingHorizontal: space[5], paddingVertical: space[3], paddingBottom: space[4] }}
      >
        <Row justify="space-between">
          <Col gap={space[1]}>
            {isLoading ? (
              <>
                <Skeleton width={140} height={11} radius={4} />
                <Skeleton width={180} height={20} radius={5} style={{ marginTop: space[1] }} />
              </>
            ) : (
              <>
                <Text
                  style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}
                >
                  {thaiDate.long(today)}
                </Text>
                <Text
                  style={{
                    fontSize: type.sizes.xl,
                    fontFamily: type.familyBold,
                    color: t.ink,
                    letterSpacing: -0.2,
                  }}
                >
                  {tx('home.greeting', { name: greetingName })}
                </Text>
              </>
            )}
          </Col>
          {isLoading ? (
            <SkeletonShape width={44} height={44} radius={22} />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: t.brandSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: t.brandInk,
                  fontFamily: type.familyBold,
                  fontSize: type.sizes.base,
                }}
              >
                {displayInitial}
              </Text>
            </View>
          )}
        </Row>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingBottom: space[5] }}>
        {isLoading ? (
          <Skeleton width={120} height={32} radius={radii.pill} />
        ) : (
          <Pressable
            onPress={() => log('farm filter chip pressed (no handler wired yet)')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              paddingHorizontal: space[4],
              paddingVertical: space[2],
              borderRadius: radii.pill,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: t.border,
              alignSelf: 'flex-start',
            }}
          >
            <View
              style={{
                width: space[2],
                height: space[2],
                borderRadius: space[1],
                backgroundColor: t.brand,
              }}
            />
            <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familySemi, color: t.ink }}>
              {tx('home.allFarms')}
            </Text>
            <Icon.arrowDown size={14} color={t.inkSoft} />
          </Pressable>
        )}
      </View>

      {/* 2×2 stat grid — same dimensions whether loading or loaded */}
      <View style={{ paddingHorizontal: space[5], paddingBottom: space[3] }}>
        <View style={{ flexDirection: 'row', gap: GRID_GAP }}>
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                variant="info"
                icon="fish"
                title={tx('home.summary.fish')}
                value={joinValue(HOME_SUMMARY.fish.value, HOME_SUMMARY.fish.unit)}
                subtitle={HOME_SUMMARY.fish.caption}
              />
              <StatCard
                variant="move"
                icon="farm"
                title={tx('home.summary.active')}
                value={joinValue(HOME_SUMMARY.active.value, HOME_SUMMARY.active.unit)}
                subtitle={HOME_SUMMARY.active.caption}
              />
            </>
          )}
        </View>
        <View style={{ height: GRID_GAP }} />
        <View style={{ flexDirection: 'row', gap: GRID_GAP }}>
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                variant="success"
                icon="feed"
                title={tx('home.summary.feed')}
                value={joinValue(HOME_SUMMARY.feed.value, HOME_SUMMARY.feed.unit)}
                subtitle={HOME_SUMMARY.feed.caption}
              />
              <StatCard
                variant="danger"
                icon="alert"
                title={tx('home.summary.deaths')}
                value={joinValue(HOME_SUMMARY.deaths.value, HOME_SUMMARY.deaths.unit)}
                subtitle={HOME_SUMMARY.deaths.caption}
              />
            </>
          )}
        </View>
      </View>

      {/* "ยังไม่ได้บันทึกวันนี้" alert strip */}
      <View style={{ paddingHorizontal: space[5], paddingBottom: space[2] }}>
        {isLoading ? (
          <AlertStripCardSkeleton />
        ) : (
          <AlertStripCard
            tone={HOME_TASK.late > 0 ? 'danger' : 'warn'}
            title={tx('home.task.stripPending')}
            subtitle={`${HOME_TASK.pending} / ${HOME_TASK.total} บ่อ`}
            emphasis={HOME_TASK.late > 0 ? `เลยกำหนด ${HOME_TASK.late} บ่อ` : undefined}
            onPress={
              HOME_TASK.pending > 0
                ? () => {
                    log('alert strip pressed', { task: HOME_TASK });
                    onOpenPond?.(11);
                  }
                : undefined
            }
          />
        )}
      </View>

      {/* สิ่งที่ต้องดู */}
      <SectionHeading
        title={tx('home.alerts')}
        count={isLoading ? undefined : HOME_ALERTS.length}
      />
      <View style={{ paddingHorizontal: space[5], gap: space[2] }}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <AlertRowSkeleton key={`alert-sk-${i}`} />)
          : HOME_ALERTS.map((a) => (
              <AlertRow
                key={a.id}
                a={a}
                onPress={() => {
                  log('alert row pressed', { id: a.id, kind: a.kind, title: a.title });
                  onOpenPond?.();
                }}
              />
            ))}
      </View>

      {/* กิจกรรมล่าสุด */}
      <SectionHeading title={tx('home.activity')} />
      <View style={{ paddingHorizontal: space[5], gap: space[2] }}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <ActivityRowSkeleton key={`act-sk-${i}`} />)
          : HOME_ACTIVITY.map((e) => <ActivityRow key={e.id} e={e} />)}
        {!isLoading && (
          <Pressable
            onPress={() => {
              log('seeAllActivity pressed');
              onOpenPond?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[1],
              paddingVertical: space[2],
              paddingHorizontal: space[1],
              marginTop: space[1],
            }}
          >
            <Text style={{ color: t.brand, fontSize: type.sizes.sm, fontFamily: type.familySemi }}>
              {tx('home.seeAllActivity')}
            </Text>
            <Icon.chevR size={14} color={t.brand} />
          </Pressable>
        )}
      </View>

      <View style={{ height: space[6] }} />
    </ScrollView>
  );
}

function joinValue(value: string, unit?: string): string {
  return unit ? `${value} ${unit}` : value;
}
