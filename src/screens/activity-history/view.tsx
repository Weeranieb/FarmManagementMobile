import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import type { ActivityItem } from '@/screens/home/components/activity-row';
import { FilterChips } from './components/filter-chips';
import { DayGroup } from './components/day-group';
import { EndCap } from './components/end-cap';
import { EmptyAll, EmptyFiltered } from './components/empty-states';
import { HistorySkeleton } from './components/history-skeleton';
import { KIND_LABEL } from './constants';
import type { ActivityHistoryState } from './hook';

type Props = ActivityHistoryState & {
  bottomClearance?: number;
  onBack?: () => void;
  onOpenActivity?: (e: ActivityItem) => void;
};

export function ActivityHistoryView({
  bottomClearance,
  onBack,
  onOpenActivity,
  isLoading,
  isEmpty,
  filteredEmpty,
  filter,
  setFilter,
  counts,
  filteredCount,
  groups,
  refreshing,
  onRefresh,
}: Props) {
  const { t } = useTheme();
  const bottomPad = bottomClearance ?? space[10];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* ── App bar ───────────────────────────────────────────────── */}
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[2],
          paddingLeft: space[2] + 2,
          paddingRight: space[3],
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
          hitSlop={6}
          android_ripple={{ color: t.surfaceAlt, borderless: true }}
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.sm + 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon.back size={22} color={t.ink} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: type.familyBold,
              color: t.ink,
              // No explicit lineHeight: 21 (≈1.23×) clipped Thai upper marks
              // (สระอิ in ประวัติ) on iOS. Let the font metrics reserve the
              // mark zone — same as the Home / Daily Log Thai headings.
            }}
          >
            ประวัติกิจกรรม
          </Text>
          {!isLoading ? (
            <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.familyNum }}>
              {isEmpty ? (
                'ยังไม่มีรายการ'
              ) : (
                <>
                  {filter === 'all' ? 'ทั้งหมด' : KIND_LABEL[filter]}{' '}
                  <Text style={{ fontFamily: type.familyNumSemi, color: t.inkSoft }}>
                    {filteredCount}
                  </Text>{' '}
                  รายการ
                </>
              )}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ── Filter chips — hidden when there is nothing to filter ──── */}
      {!isEmpty ? (
        <FilterChips filter={filter} counts={counts} disabled={isLoading} onChange={setFilter} />
      ) : null}

      {/* ── Scroll body ───────────────────────────────────────────── */}
      <ScrollView
        delaysContentTouches={false}
        style={{ flex: 1 }}
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
        {isLoading ? (
          <HistorySkeleton />
        ) : isEmpty ? (
          <EmptyAll />
        ) : filteredEmpty ? (
          <EmptyFiltered kind={filter} onClear={() => setFilter('all')} />
        ) : (
          <View style={{ paddingHorizontal: space[4], paddingTop: space[2] }}>
            {groups.map((g, gi) => (
              <DayGroup key={g.dateKey} group={g} first={gi === 0} onPressItem={onOpenActivity} />
            ))}
            <EndCap count={filteredCount} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
