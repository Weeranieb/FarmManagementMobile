import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { VIBRANT_BRAND, thMonthAbbr } from '../constants';

export type MonthMark = 'data' | 'unsaved' | 'closed';

/**
 * Marks keyed by `${gregorianYear}-${monthIdx}` — month index is 0-based,
 * matching Date.getMonth(). Pass an empty object when no indicators apply.
 */
export type MonthMarksMap = Readonly<Record<string, MonthMark>>;

type YearMonth = { y: number; m: number };

type Props = {
  visible: boolean;
  /** Currently committed selection (year + 0-based month). The sheet seeds
   *  internal state from this on each open so the user always starts from
   *  the current daily-log date. */
  current: YearMonth;
  /** Today's anchor — used to render the "outlined" today cell and the
   *  "เดือนนี้" quick-jump chip. */
  today: YearMonth;
  marks?: MonthMarksMap;
  /** Months strictly before this anchor render as out-of-range (disabled).
   *  Pass `null` to disable the lower bound entirely. */
  outOfRangeBefore?: YearMonth | null;
  /** Months strictly after this anchor render as muted (non-confirmable).
   *  Mirrors the daily-log's "no future months" rule. Defaults to `today`. */
  outOfRangeAfter?: YearMonth | null;
  onClose: () => void;
  /** Fires when the user taps "เลือก" with a non-disabled month selected.
   *  The view layer is responsible for unsaved-changes guards (this sheet
   *  doesn't know whether the page is dirty). */
  onConfirm: (year: number, monthIdx: number) => void;
};

function compareYM(a: YearMonth, b: YearMonth): number {
  if (a.y !== b.y) return a.y - b.y;
  return a.m - b.m;
}

export function MonthYearPickerSheet({
  visible,
  current,
  today,
  marks,
  outOfRangeBefore = null,
  outOfRangeAfter,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const upperBound = outOfRangeAfter === undefined ? today : outOfRangeAfter;

  const [viewYear, setViewYear] = useState(current.y);
  const [selected, setSelected] = useState<YearMonth>(current);

  // Seed on each open so reopening after a different month change picks up
  // the new "current" without leaking the previous session's selection.
  useEffect(() => {
    if (visible) {
      setViewYear(current.y);
      setSelected(current);
    }
  }, [visible, current]);

  const beYear = viewYear + 543;
  const months = Array.from({ length: 12 }, (_, i) => i);

  const selectedDisabled = (() => {
    if (outOfRangeBefore && compareYM(selected, outOfRangeBefore) < 0) return true;
    if (upperBound && compareYM(selected, upperBound) > 0) return true;
    return false;
  })();

  const handleConfirm = () => {
    if (selectedDisabled) return;
    onConfirm(selected.y, selected.m);
  };

  const handleToday = () => {
    setViewYear(today.y);
    setSelected({ y: today.y, m: today.m });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(11,18,32,.50)',
          }}
        >
          <Pressable
            onPress={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            accessibilityRole="button"
            accessibilityLabel="ปิด"
          />

          <Animated.View
            entering={SlideInDown.duration(260)}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: t.surface,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              paddingBottom: insets.bottom + 14,
              shadowColor: '#0b1220',
              shadowOpacity: 0.25,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: -16 },
              elevation: 12,
            }}
          >
            {/* drag handle */}
            <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 4 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: t.border,
                }}
              />
            </View>

            {/* header */}
            <View
              style={{
                paddingHorizontal: 18,
                paddingTop: 4,
                paddingBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: type.familyBold,
                    color: t.ink,
                    letterSpacing: 0.1,
                  }}
                >
                  เลือกเดือน · ปี
                </Text>
                <Text
                  style={{
                    fontSize: 11.5,
                    color: t.inkMute,
                    marginTop: 2,
                  }}
                >
                  เลือกวันในเดือนใหม่จาก
                  <Text style={{ color: t.inkSoft, fontFamily: type.familyBold }}>
                    {'แถบวัน'}
                  </Text>
                  ด้านบน
                </Text>
              </View>
              <Pressable
                onPress={handleToday}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: VIBRANT_BRAND[100],
                  backgroundColor: VIBRANT_BRAND[50],
                }}
                accessibilityRole="button"
                accessibilityLabel="เดือนนี้"
              >
                <Icon.sun size={12} color={VIBRANT_BRAND[700]} stroke={2.4} />
                <Text
                  style={{
                    fontSize: 12.5,
                    fontFamily: type.familyBold,
                    color: VIBRANT_BRAND[700],
                  }}
                >
                  เดือนนี้
                </Text>
              </Pressable>
            </View>

            {/* year nav */}
            <YearNavRow
              beYear={beYear}
              onPrev={() => setViewYear((y) => y - 1)}
              onNext={() => setViewYear((y) => y + 1)}
              nextDisabled={upperBound != null && viewYear >= upperBound.y}
            />

            {/* 12-month grid · 3 cols × 4 rows */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginHorizontal: -4,
                }}
              >
                {months.map((m) => {
                  const isToday = today.y === viewYear && today.m === m;
                  const isSelected = selected.y === viewYear && selected.m === m;
                  const ym: YearMonth = { y: viewYear, m };
                  const future = upperBound != null && compareYM(ym, upperBound) > 0;
                  const outOfRange =
                    outOfRangeBefore != null && compareYM(ym, outOfRangeBefore) < 0;
                  const mark = marks?.[`${viewYear}-${m}`];
                  return (
                    <View key={m} style={{ width: '33.333%', paddingHorizontal: 4, paddingBottom: 8 }}>
                      <MonthCell
                        label={thMonthAbbr(m)}
                        isToday={isToday}
                        isSelected={isSelected}
                        mark={mark}
                        outOfRange={outOfRange}
                        future={future}
                        onPress={() => {
                          if (outOfRange || future) return;
                          setSelected(ym);
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* footer */}
            <View
              style={{
                paddingHorizontal: 14,
                paddingTop: 10,
                paddingBottom: 4,
                flexDirection: 'row',
                gap: 10,
                borderTopWidth: 1,
                borderTopColor: t.border,
                backgroundColor: t.surface,
              }}
            >
              <Pressable
                onPress={onClose}
                style={{
                  height: 46,
                  paddingHorizontal: 22,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.surface,
                }}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: type.familyBold,
                    color: t.inkSoft,
                  }}
                >
                  ยกเลิก
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={selectedDisabled}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  backgroundColor: VIBRANT_BRAND[600],
                  opacity: selectedDisabled ? 0.45 : 1,
                  shadowColor: VIBRANT_BRAND[700],
                  shadowOpacity: 0.35,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 4,
                }}
                accessibilityRole="button"
                accessibilityLabel={`เลือก ${thMonthAbbr(selected.m)} ${selected.y + 543}`}
              >
                <Icon.check size={16} color="#fff" />
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: type.familyBold,
                    color: '#fff',
                  }}
                >
                  เลือก{' '}
                  <Text style={{ fontFamily: type.familyNumBold }}>
                    {thMonthAbbr(selected.m)} {selected.y + 543}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function YearNavRow({
  beYear,
  onPrev,
  onNext,
  nextDisabled,
}: {
  beYear: number;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Pressable
        onPress={onPrev}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surfaceAlt,
        }}
        accessibilityRole="button"
        accessibilityLabel="ปีก่อนหน้า"
      >
        <Icon.chevL size={14} color={t.inkSoft} />
      </Pressable>
      <View
        style={{
          flex: 1,
          height: 42,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.surfaceAlt,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        {/* Single Text wrapper so RN merges both runs into one line box —
            this keeps the Thai and Latin glyphs sharing a baseline instead of
            each child Text picking its own. */}
        <Text
          style={{
            fontSize: 17,
            color: t.ink,
            fontFamily: type.familyBold,
            includeFontPadding: false,
          }}
        >
          <Text style={{ color: t.inkSoft }}>{'ปี '}</Text>
          <Text style={{ fontFamily: type.familyNumBold, letterSpacing: 0.5 }}>
            {beYear}
          </Text>
        </Text>
      </View>
      <Pressable
        onPress={onNext}
        disabled={nextDisabled}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surfaceAlt,
          opacity: nextDisabled ? 0.4 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel="ปีถัดไป"
        accessibilityState={{ disabled: nextDisabled }}
      >
        <Icon.chevR size={14} color={nextDisabled ? t.borderStrong : t.inkSoft} />
      </Pressable>
    </View>
  );
}

// Slate palette for closed-cycle months — mirrors the MAINT/CLOSED swatches
// used in TableRow's locked state, kept self-contained here so the picker
// reads "archived record" rather than "inactive maintenance."
const CLOSED_TINT = 'rgba(82,96,122,.08)';
const CLOSED_INK = '#52607a';

function MonthCell({
  label,
  isToday,
  isSelected,
  mark,
  outOfRange,
  future,
  onPress,
}: {
  label: string;
  isToday: boolean;
  isSelected: boolean;
  mark: MonthMark | undefined;
  outOfRange: boolean;
  future: boolean;
  onPress: () => void;
}) {
  const { t } = useTheme();

  const opacity = outOfRange ? 0.3 : future ? 0.45 : 1;
  const closedMark = mark === 'closed' && !isSelected;
  const disabled = outOfRange || future;
  // Only reserve the mark-slot row when there's actually something to render.
  // Without this the label sits ~6px above center on every plain cell because
  // the empty 13px row still steals vertical space.
  const hasMark = !outOfRange && mark != null;

  const borderColor = isSelected
    ? VIBRANT_BRAND[600]
    : isToday
      ? VIBRANT_BRAND[600]
      : t.border;
  const borderWidth = isSelected ? 0 : isToday ? 1.5 : 1;
  const background = isSelected
    ? VIBRANT_BRAND[600]
    : closedMark
      ? CLOSED_TINT
      : t.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        height: 62,
        paddingHorizontal: 8,
        paddingVertical: 9,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity,
        backgroundColor: background,
        borderColor,
        borderWidth,
        shadowColor: isSelected ? VIBRANT_BRAND[700] : 'transparent',
        shadowOpacity: isSelected ? 0.3 : 0,
        shadowRadius: isSelected ? 12 : 0,
        shadowOffset: { width: 0, height: 6 },
        elevation: isSelected ? 3 : 0,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text
        style={{
          fontSize: 15,
          fontFamily: isSelected || isToday ? type.familyBold : type.familySemi,
          color: isSelected ? '#fff' : closedMark ? CLOSED_INK : t.ink,
          // Thai upper vowels (ี / ิ on มี.ค. and มิ.ย.) need headroom above
          // the consonant — too-tight lineHeight clips the diacritic.
          lineHeight: 22,
        }}
      >
        {label}
      </Text>
      {hasMark ? (
        <View style={{ height: 13, alignItems: 'center', justifyContent: 'center' }}>
          <MarkGlyph mark={mark} isSelected={isSelected} outOfRange={outOfRange} />
        </View>
      ) : null}
    </Pressable>
  );
}

function MarkGlyph({
  mark,
  isSelected,
  outOfRange,
}: {
  mark: MonthMark | undefined;
  isSelected: boolean;
  outOfRange: boolean;
}) {
  const { t } = useTheme();
  if (outOfRange || !mark) return null;

  if (mark === 'closed') {
    return (
      <Icon.lock
        size={10}
        color={isSelected ? 'rgba(255,255,255,.9)' : CLOSED_INK}
      />
    );
  }
  if (mark === 'unsaved') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            backgroundColor: isSelected ? '#ffd887' : t.warn,
          }}
        />
        <Text
          style={{
            fontSize: 10,
            fontFamily: type.familyBold,
            color: isSelected ? '#ffd887' : t.warn,
          }}
        >
          มีค้าง
        </Text>
      </View>
    );
  }
  // data
  return (
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 999,
        backgroundColor: isSelected ? 'rgba(255,255,255,.7)' : t.border,
      }}
    />
  );
}
