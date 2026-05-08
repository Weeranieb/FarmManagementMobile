import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii, space } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Skeleton, SkeletonShape } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate } from '@/locale/thaiDate';
import { today } from '@/shared/time';
// Home-specific components are co-located under ./components per the
// "Consider a /screens folder" pattern in the Expo folder-structure guide.
import { StatCard } from './components/stat-card';
import { StatCardSkeleton } from './components/stat-card-skeleton';
import { AlertStripCard } from './components/alert-strip-card';
import { AlertStripCardSkeleton } from './components/alert-strip-card-skeleton';
import { AlertRow } from './components/alert-row';
import { AlertRowSkeleton } from './components/alert-row-skeleton';
import { ActivityRow } from './components/activity-row';
import { ActivityRowSkeleton } from './components/activity-row-skeleton';
import { SectionHeading } from './components/section-heading';
import {
  GRID_GAP,
  HOME_ACTIVITY,
  HOME_ALERTS,
  HOME_SUMMARY,
  HOME_TASK,
  joinValue,
  log,
} from './constants';

type Props = {
  showHeader?: boolean;
  onOpenPond?: (pondId?: number) => void;
  /** Bottom scroll padding when FAB floats above tab bar (tab route only). */
  fabClearance?: number;
  /** When true, swap real cards for skeleton placeholders. */
  isLoading?: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  greetingName: string;
  displayInitial: string;
};

export function HomeView({
  showHeader = true,
  onOpenPond,
  fabClearance,
  isLoading = false,
  refreshing,
  onRefresh,
  greetingName,
  displayInitial,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const bottomPad = fabClearance ?? space[10] + space[8];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: bottomPad }}
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
