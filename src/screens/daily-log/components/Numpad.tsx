import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, View, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFeedCollectionsData } from '@/features/feed-collection';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import {
  CELL_HIGHLIGHT,
  CELL_MAX_VALUE,
  COLS,
  GROUP_LIGHT,
  VIBRANT_BRAND,
  fmtTh,
  isCellValueInvalid,
  numpadSheetHeight,
  thMonthAbbr,
  type ColKey,
  type GroupKey,
} from '../constants';
import { FeedTypePicker } from './FeedTypePicker';
import { GroupIcon } from './GroupIcon';
import { useSheetSlideIn } from './useSheetSlideIn';

type Props = {
  visible: boolean;
  pondId: string;
  col: ColKey;
  initialValue: number | '';
  /** Latest prior entry for this pond + column — value plus the date it was
   *  logged on. Renders as "เดิม 14 · 1 พ.ค." underneath the typed value. */
  yesterday?: { value: number; date: Date } | null;
  /** Feed-collection ID used in the active pond's most recent entry. When
   *  present in the available feeds, it becomes the default chip selection —
   *  so re-entering data for a pond keeps the feed type it was last logged
   *  with. */
  lastUsedFeedId?: number | null;
  /** No further cell to advance to — the primary button reads "เสร็จสิ้น"
   *  and commits-then-closes instead of advancing with "ถัดไป". */
  isLastCell?: boolean;
  /** Bottom safe-area inset, sourced from the screen (outside this Modal).
   *  `useSafeAreaInsets()` called from inside an Android Modal reads
   *  stale/zero on the Modal's own first render — its native window hasn't
   *  received insets yet — so the sheet takes this as a prop instead. */
  bottomInset?: number;
  /** Fires on every keystroke (parsed value, may be out of range) so the
   *  table cell behind the sheet can mirror what's being typed live. */
  onChange?: (value: number | '') => void;
  onCancel: () => void;
  /** `feedId` is the feed-collection ID the user (or the auto-default) had
   *  selected at the moment of commit. null for columns that don't carry a
   *  feed type (death / catch). */
  onCommit: (value: number | '', feedId: number | null) => void;
  onNext: (value: number | '', feedId: number | null) => void;
};

function applyKey(prev: string, key: string, integer: boolean): string {
  if (key === '⌫') {
    return prev.slice(0, -1);
  }
  if (key === '.') {
    if (integer || prev.includes('.')) return prev;
    return prev === '' ? '0.' : prev + '.';
  }
  if (prev === '0' && key !== '.') return key;
  return prev + key;
}

function parseValue(buf: string): number | '' {
  if (buf === '' || buf === '.') return '';
  const n = Number(buf);
  return Number.isFinite(n) ? n : '';
}

export function Numpad({
  visible,
  pondId,
  col,
  initialValue,
  yesterday,
  lastUsedFeedId,
  isLastCell = false,
  bottomInset = 0,
  onChange,
  onCancel,
  onCommit,
  onNext,
}: Props) {
  const { t } = useTheme();
  const meta = COLS.find((c) => c.key === col);
  const group: GroupKey = (meta?.group ?? 'pellet') as GroupKey;
  const integerOnly = meta?.integer === true;
  const g = GROUP_LIGHT[group];

  const supportsFeedType = group === 'pellet' || group === 'fresh';
  const slotLabel = meta?.leaf || g.title;

  const [buf, setBuf] = useState<string>(() =>
    initialValue === '' || initialValue == null ? '' : String(initialValue),
  );
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Real feed-collection options from the backend, scoped to this column's
  // group (pellet rows show only pellet feeds; fresh rows show only fresh).
  const { data: allFeeds, isLoading: feedsLoading, isError: feedsError } = useFeedCollectionsData();
  const feeds = useMemo(
    () => (supportsFeedType ? allFeeds.filter((f) => f.kind === group) : []),
    [allFeeds, supportsFeedType, group],
  );

  // Default selection order: keep the user's current pick if still available,
  // otherwise prefer the feed used in the active pond's most recent entry,
  // otherwise fall back to the first feed in the list. The middle step is
  // what lets a returning user keep typing without re-picking the same feed.
  useEffect(() => {
    if (!supportsFeedType) {
      setSelectedFeedId(null);
      return;
    }
    if (selectedFeedId != null && feeds.some((f) => f.id === selectedFeedId)) return;
    const fromLastEntry =
      lastUsedFeedId != null && feeds.some((f) => f.id === lastUsedFeedId) ? lastUsedFeedId : null;
    setSelectedFeedId(fromLastEntry ?? feeds[0]?.id ?? null);
  }, [feeds, supportsFeedType, selectedFeedId, lastUsedFeedId]);

  useEffect(() => {
    if (visible) {
      setBuf(initialValue === '' || initialValue == null ? '' : String(initialValue));
      setPickerOpen(false);
    }
  }, [visible, initialValue, pondId, col]);

  const displayValue = useMemo(() => (buf === '' ? '0' : buf), [buf]);
  // Mirror the table's validation rule inside the keypad so the user sees
  // the rejection the moment a tap pushes the typed buffer past the ceiling
  // (Daily Log v7 frame AA — header number flips red, inline hint appears,
  // "ถัดไป" disables). `parseValue` returns `''` for the empty/dot-only
  // buffer, which `isCellValueInvalid` treats as valid — empty input is a
  // commit-time concern, not a range error.
  const parsed = useMemo(() => parseValue(buf), [buf]);
  const isInvalid = isCellValueInvalid(parsed);
  const { height: screenH } = useWindowDimensions();
  const sheetH = numpadSheetHeight(screenH, bottomInset);

  const sheetAnim = useSheetSlideIn(sheetH);

  if (!visible) return null;

  const handleKey = (key: string) => {
    const next = applyKey(buf, key, integerOnly);
    setBuf(next);
    onChange?.(parseValue(next));
  };

  const handleCancel = () => {
    onCancel();
  };
  const handleNext = () => {
    if (isInvalid) return;
    onNext(parsed, supportsFeedType ? selectedFeedId : null);
  };
  const handleCommit = () => {
    if (isInvalid) return;
    onCommit(parsed, supportsFeedType ? selectedFeedId : null);
  };

  const cur = supportsFeedType ? (feeds.find((f) => f.id === selectedFeedId) ?? null) : null;
  // Calm/desaturated brand swatch — same calibration as FeedTypePicker rows.
  const chipDot =
    group === 'fresh' ? { dot: '#5ca070', tintA: '#ebf4ee' } : { dot: '#5478c2', tintA: '#eaf0fb' };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(120)}
          // Light scrim — the daily-log view scrolls the row being edited to
          // sit above this sheet, so the backdrop is kept faint enough that
          // the pinned row (and its blue active-cell highlight) reads clearly.
          style={{ flex: 1, backgroundColor: 'rgba(11,18,32,.12)' }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleCommit} />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: sheetH,
              backgroundColor: t.surfaceAlt,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderTopWidth: 1,
              borderTopColor: t.border,
            },
            sheetAnim,
          ]}
        >
          {/* grabber */}
          <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 3 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: t.border }} />
          </View>

          {/* header — two rows so a long feed name never collides with the
              value/detail: identity + feed selector on top, hero value +
              prior-entry detail below (each row owns its full width). */}
          <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10, gap: 8 }}>
            {/* Row 1: group icon + pond·slot (left) · feed-type selector (right) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  backgroundColor: g.tint,
                  borderWidth: 1,
                  borderColor: g.edge,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupIcon group={group} size={14} color={g.ink} />
              </View>
              <Text
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12,
                  fontFamily: type.familyBold,
                  color: t.inkSoft,
                  letterSpacing: 0.2,
                }}
                numberOfLines={1}
              >
                บ่อ {pondId} · {slotLabel}
              </Text>

              {/* feed-type selector — its own slot on the top row */}
              {supportsFeedType && cur ? (
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  style={{
                    justifyContent: 'center',
                    paddingVertical: 8,
                    paddingLeft: 11,
                    paddingRight: 10,
                    borderRadius: 13,
                    backgroundColor: t.surface,
                    borderWidth: 1,
                    borderColor: t.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 9,
                    maxWidth: 200,
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="เลือกชนิดอาหาร"
                >
                  {/* Brand color dot with halo */}
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: chipDot.dot,
                      borderWidth: 3,
                      borderColor: chipDot.tintA,
                    }}
                  />
                  <View style={{ minWidth: 0, flexShrink: 1 }}>
                    {/* Eyebrow shows the feed category, but drop it when it would
                        just repeat the feed name (e.g. fresh feed named "เหยื่อสด")
                        so the chip isn't "เหยื่อสด / เหยื่อสด". */}
                    {cur.name !== g.title ? (
                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: type.familyBold,
                          color: t.inkMute,
                          letterSpacing: 0.55,
                          textTransform: 'uppercase',
                          lineHeight: 14,
                        }}
                      >
                        {g.title}
                      </Text>
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: cur.name !== g.title ? 2 : 0,
                        fontSize: 13,
                        fontFamily: type.familyBold,
                        color: t.ink,
                        lineHeight: 18,
                      }}
                    >
                      {cur.name}
                    </Text>
                  </View>
                  <Icon.arrowDown size={12} color={t.inkMute} />
                </Pressable>
              ) : null}
            </View>

            {/* Row 2: typed value + unit (left) · prior entry (right) — aligned
                under the pond label (icon width + gap = 42). */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingLeft: 42 }}>
              <Text
                style={{
                  fontSize: 34,
                  lineHeight: 36,
                  fontFamily: type.familyNumBold,
                  color: isInvalid ? CELL_HIGHLIGHT.errorInk : t.ink,
                  letterSpacing: -1,
                }}
              >
                {displayValue}
              </Text>
              <Text style={{ fontSize: 14, color: t.inkSoft, fontFamily: type.familySemi }}>
                {g.unit}
              </Text>
              {yesterday != null && !isInvalid ? (
                <Text
                  numberOfLines={1}
                  style={{ marginLeft: 'auto', flexShrink: 1, fontSize: 12, color: t.inkSoft }}
                >
                  เดิม{' '}
                  <Text style={{ fontFamily: type.familyNumBold, color: t.inkSoft }}>
                    {fmtTh(yesterday.value)}
                  </Text>
                  {' · '}
                  {yesterday.date.getDate()} {thMonthAbbr(yesterday.date.getMonth())}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Inline validation hint — Daily Log v7 frame AA. Replaces the
           *  default "เดิม X · D MMM" hint once the buffer exceeds the
           *  range so the user reads only one piece of guidance at a time. */}
          {isInvalid ? (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: -4,
                marginBottom: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: CELL_HIGHLIGHT.errorTint,
                borderWidth: 1,
                borderColor: CELL_HIGHLIGHT.errorRing,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  backgroundColor: CELL_HIGHLIGHT.errorBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: type.familyNumBold,
                    fontSize: 11,
                    lineHeight: 12,
                    color: '#fff',
                  }}
                >
                  !
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: type.familyBold,
                  fontSize: 13,
                  color: CELL_HIGHLIGHT.errorInk,
                }}
              >
                {`ค่าต้องอยู่ระหว่าง 0–${CELL_MAX_VALUE} ${g.unit}`}
              </Text>
            </View>
          ) : null}

          {/* keypad — 4 rows × 3 cols */}
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['.', '0', '⌫'],
            ].map((row, ri) => (
              <View
                key={ri}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  gap: 8,
                  marginBottom: ri < 3 ? 8 : 0,
                }}
              >
                {row.map((k) => {
                  const dim = k === '.' || k === '⌫';
                  const disabled = k === '.' && integerOnly;
                  return (
                    <Pressable
                      key={k}
                      disabled={disabled}
                      onPress={() => handleKey(k)}
                      style={{
                        flex: 1,
                        borderRadius: 14,
                        backgroundColor: dim ? t.surfaceAlt : t.surface,
                        borderWidth: 1,
                        borderColor: t.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabled ? 0.4 : 1,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={k}
                    >
                      {k === '⌫' ? (
                        <Icon.back size={22} color={t.inkSoft} />
                      ) : (
                        <Text
                          style={{
                            fontFamily: type.familyNumSemi,
                            fontSize: 24,
                            color: dim ? t.inkSoft : t.ink,
                            letterSpacing: -0.5,
                          }}
                        >
                          {k}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* footer */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: 12 + bottomInset,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Pressable
              onPress={handleCancel}
              style={{
                height: 46,
                paddingHorizontal: 18,
                borderRadius: 13,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.inkSoft }}>
                ยกเลิก
              </Text>
            </Pressable>
            <Pressable
              onPress={isLastCell ? handleCommit : handleNext}
              disabled={isInvalid}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 13,
                backgroundColor: VIBRANT_BRAND[600],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isInvalid ? 0.5 : 1,
              }}
            >
              <Text style={{ fontFamily: type.familyBold, fontSize: 15, color: '#fff' }}>
                {isLastCell ? 'เสร็จสิ้น' : 'ถัดไป'}
              </Text>
              {isLastCell ? (
                <Icon.check size={16} color="#fff" stroke={2.6} />
              ) : (
                <Icon.chevR size={16} color="#fff" />
              )}
            </Pressable>
          </View>

          <FeedTypePicker
            visible={pickerOpen}
            group={group}
            feeds={feeds}
            selectedId={selectedFeedId}
            onSelect={setSelectedFeedId}
            onClose={() => setPickerOpen(false)}
            isLoading={feedsLoading}
            isError={feedsError}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}
