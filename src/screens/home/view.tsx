import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';
import { Skeleton, SkeletonShape, Tappable } from '@/components/ui';
import { today } from '@/shared/time';
import { ActivityRow, type ActivityItem } from './components/activity-row';
import { ActivityRowSkeleton } from './components/activity-row-skeleton';
import { DailyLogCard } from './components/daily-log-card';
import { DailyLogCardSkeleton } from './components/daily-log-card-skeleton';
import {
  SecondaryActionRow,
  SecondaryActionRowSkeleton,
  type SecondaryActionId,
} from './components/secondary-action-row';
import { TodayStrip, TodayStripSkeleton } from './components/today-strip';
import { EmptyHero, EmptyTrailing } from './components/empty-hero';
import { SavedToast } from './components/saved-toast';
import { SectionHeading } from './components/section-heading';
import { log, type HomeDigest, type PendingPond } from './constants';
import type { DailyLogTarget } from '@/screens/daily-log/route';

type Props = {
  bottomClearance?: number;
  justSavedCount: number;
  refreshing: boolean;
  onRefresh: () => void;
  greetingName: string;
  displayInitial: string;
  digest: HomeDigest | null;
  activity: ActivityItem[];
  activityLoading: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  isJustSaved: boolean;
  /** Toast visibility is independent of `isJustSaved` so the demo can show
   *  the "+3" bump pill on the card without the toast hanging around forever. */
  showSavedToast?: boolean;
  onOpenDailyLog?: (target?: DailyLogTarget) => void;
  onOpenActivity?: (e: ActivityItem) => void;
  onOpenSecondaryAction?: (id: SecondaryActionId) => void;
  onCreateFarm?: () => void;
  onPressSavedToast?: () => void;
  onDismissSavedToast?: () => void;
  /** Tap "ดูประวัติทั้งหมด" → full ประวัติกิจกรรม screen. */
  onSeeHistory?: () => void;
  /** Tap the avatar circle → Profile tab. */
  onPressProfile?: () => void;
};

export function HomeView({
  bottomClearance,
  justSavedCount,
  refreshing,
  onRefresh,
  greetingName,
  displayInitial,
  digest,
  activity,
  activityLoading,
  isLoading,
  isEmpty,
  isJustSaved,
  showSavedToast,
  onOpenDailyLog,
  onOpenActivity,
  onOpenSecondaryAction,
  onCreateFarm,
  onPressSavedToast,
  onDismissSavedToast,
  onSeeHistory,
  onPressProfile,
}: Props) {
  const { t } = useTheme();
  const bottomPad = bottomClearance ?? space[10];

  const handlePending = (pond: PendingPond) => {
    log('pending chip pressed', {
      id: pond.id,
      name: pond.name,
      farmId: pond.farmId,
      lateDays: pond.lateDays,
    });
    onOpenDailyLog?.({ pondId: pond.id, farmId: pond.farmId });
  };
  const handleActivity = (e: ActivityItem) => {
    log('activity row pressed', {
      id: e.id,
      kind: e.kind,
      recordType: e.recordType,
      recordId: e.recordId,
    });
    onOpenActivity?.(e);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        // iOS holds a touch ~150ms to detect a scroll before passing it to a
        // child, which makes the tiles / CTA feel laggy to tap. Hand touches
        // to children immediately; the scroll responder still takes over on a
        // drag, so scrolling is unaffected.
        delaysContentTouches={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.brand}
            {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
          />
        }
      >
        {/* (1) Greeting */}
        <View
          style={{
            paddingHorizontal: space[5],
            paddingTop: space[2] - 2,
            paddingBottom: space[3] + 2,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <Skeleton width={180} height={22} radius={5} />
            ) : (
              <Text
                style={{
                  fontSize: type.sizes.xl,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  letterSpacing: -0.2,
                }}
                numberOfLines={1}
              >
                {isEmpty ? 'ยินดีต้อนรับ' : `สวัสดี, คุณ${greetingName}`}
              </Text>
            )}
          </View>
          {isLoading ? (
            <SkeletonShape width={40} height={40} radius={20} />
          ) : !isEmpty ? (
            // Chrome stays on the inner View; the Pressable carries no style so
            // react-native-css-interop can't mangle the circle (see the
            // Pressable note in daily-log-card.tsx).
            <Tappable
              onPress={onPressProfile}
              accessibilityRole="button"
              accessibilityLabel="โปรไฟล์"
              hitSlop={8}
              android_ripple={{ color: t.surfaceAlt, borderless: true }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
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
            </Tappable>
          ) : null}
        </View>

        {/* (2) PRIMARY ACTION — Daily Log card. Above the fold. */}
        <View style={{ paddingHorizontal: space[4], paddingBottom: space[2] + 2 }}>
          {isLoading ? (
            <DailyLogCardSkeleton />
          ) : isEmpty ? (
            <EmptyHero onCreateFarm={onCreateFarm} />
          ) : digest ? (
            <DailyLogCard
              digest={digest}
              date={today}
              bumped={isJustSaved}
              justSavedCount={justSavedCount}
              onPressCTA={() => onOpenDailyLog?.()}
              onPressPending={handlePending}
            />
          ) : null}
        </View>

        {/* (2b) SECONDARY actions — เติม / ย้าย / ขาย. Hidden in empty. */}
        {!isEmpty ? (
          <View style={{ paddingHorizontal: space[4], paddingBottom: space[3] + 2 }}>
            {isLoading ? (
              <SecondaryActionRowSkeleton />
            ) : (
              <SecondaryActionRow onPress={onOpenSecondaryAction} />
            )}
          </View>
        ) : null}

        {/* (3) Honest small stats — only from real saved logs. Hidden in empty. */}
        {!isEmpty ? (
          <View style={{ paddingHorizontal: space[4], paddingBottom: space[2] }}>
            {isLoading || !digest ? <TodayStripSkeleton /> : <TodayStrip digest={digest} />}
          </View>
        ) : null}

        {/* (4) Recent activity — live GET /activity feed (newest 6). The
            section hides entirely when there are no discrete events yet
            (honest empty state); the skeleton shows while the feed loads. */}
        {!isEmpty && (activityLoading || activity.length > 0) ? (
          <>
            <SectionHeading
              title="กิจกรรมล่าสุด"
              rightLabel={!activityLoading ? 'ดูประวัติทั้งหมด' : undefined}
              onRightPress={() => {
                log('seeAllActivity pressed');
                onSeeHistory?.();
              }}
            />
            <View style={{ paddingHorizontal: space[4] }}>
              <View
                style={{
                  backgroundColor: t.surface,
                  borderWidth: 1,
                  borderColor: t.border,
                  borderRadius: 18,
                  overflow: 'hidden',
                }}
              >
                {activityLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <ActivityRowSkeleton key={`act-sk-${i}`} divider={i < 4} />
                    ))
                  : activity
                      .slice(0, 6)
                      .map((e, i, arr) => (
                        <ActivityRow
                          key={e.id}
                          e={e}
                          divider={i < arr.length - 1}
                          onPress={() => handleActivity(e)}
                        />
                      ))}
              </View>
            </View>
          </>
        ) : null}

        {isEmpty ? <EmptyTrailing /> : null}

        <View style={{ height: space[6] }} />
      </ScrollView>

      {isJustSaved && (showSavedToast ?? true) ? (
        // The tab bar takes its own layout space (it doesn't overlay this
        // view), so the toast only needs a small gap above the view's bottom
        // edge — not the full scroll clearance.
        <SavedToast
          count={justSavedCount}
          bottom={space[3]}
          onPress={onPressSavedToast}
          onDismiss={onDismissSavedToast}
        />
      ) : null}
    </View>
  );
}
