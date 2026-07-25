import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFeedCollectionsData } from '@/features/feed-collection';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import {
  CELL_HIGHLIGHT,
  CELL_MAX_VALUE,
  COLS,
  GROUP_LIGHT,
  NUMPAD_KEY_ROW_GAP,
  NUMPAD_KEY_ROW_H,
  VIBRANT_BRAND,
  isCellValueInvalid,
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
  /** Stable identity of the cell being edited (e.g. `${day}:${col}` for the
   *  ledger, `${pondKey}:${col}` for the daily log). Re-seeding and the
   *  "pristine" overwrite key off THIS, not `initialValue` — which in the
   *  pond-ledger changes live while typing (so it can't signal a cell switch). */
  cellKey: string;
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
  /** Reports the sheet's actual rendered height (incl. bottom inset) on layout.
   *  Lets the host scroll the edited cell clear of the real keypad rather than
   *  an estimate — so it stays correct across screen sizes, densities, columns
   *  (feed selector on/off), and when the validation hint grows the sheet. */
  onHeight?: (h: number) => void;
  /** Reports the selected feed-collection id (null for columns without a feed
   *  type) whenever it changes — including the initial default. Lets the host
   *  record the pick as soon as the cell is focused, so a pellet/fresh amount
   *  is never committed (via cell-switch or a live edit) without the feed id
   *  the backend requires. */
  onFeedChange?: (feedId: number | null) => void;
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function NumKey({
  label,
  dim,
  disabled,
  onPress,
}: {
  label: string;
  dim: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { t } = useTheme();
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(0);
  const restBg = dim ? t.surfaceAlt : t.surface;
  const pressBg = dim ? t.surfaceSunk : t.surfaceAlt;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : 1 - press.value * 0.06 }],
    backgroundColor: interpolateColor(press.value, [0, 1], [restBg, pressBg]),
    borderColor: interpolateColor(press.value, [0, 1], [t.border, t.borderStrong]),
  }));
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 55 });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 160 });
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          flex: 1,
          borderRadius: 14,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        },
        animStyle,
      ]}
    >
      {label === '⌫' ? (
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
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

export function Numpad({
  visible,
  pondId,
  col,
  initialValue,
  cellKey,
  lastUsedFeedId,
  isLastCell = false,
  bottomInset = 0,
  onChange,
  onCancel,
  onCommit,
  onNext,
  onHeight,
  onFeedChange,
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
  // Fresh focus starts "pristine": the seeded value shows, but the first
  // keystroke overwrites it instead of appending (type 4 over 20 → 4, not 204).
  // Cleared on the first key; reset whenever the edited cell changes (below).
  const [pristine, setPristine] = useState(true);

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

  // Surface the effective feed pick (default or user-chosen) to the host so it
  // can record it the moment the cell is focused — see `onFeedChange` doc.
  useEffect(() => {
    onFeedChange?.(supportsFeedType ? selectedFeedId : null);
  }, [selectedFeedId, supportsFeedType, onFeedChange]);

  // Re-seed only when the *cell* changes — not when `initialValue` changes
  // (pond-ledger writes live on every keystroke; reseeding would clobber typing).
  const seededCell = useRef<string | null>(null);
  if (visible && seededCell.current !== cellKey) {
    seededCell.current = cellKey;
    setBuf(initialValue === '' || initialValue == null ? '' : String(initialValue));
    setPristine(true);
    setPickerOpen(false);
  }

  const displayValue = buf === '' ? '0' : buf;
  const parsed = parseValue(buf);
  const isInvalid = isCellValueInvalid(parsed);
  // The sheet is content-driven (auto height) — slide it in from the full
  // screen height so it always starts fully off-screen regardless of content.
  const { height: screenH } = useWindowDimensions();
  const sheetAnim = useSheetSlideIn(screenH);

  // The keypad is no longer a Modal, so it doesn't get Android back handling for
  // free. While it's up, hardware-back cancels the keypad (and is consumed, so
  // it doesn't pop the route). No-op on iOS.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  if (!visible) return null;

  const handleKey = (key: string) => {
    // On fresh focus the first key overwrites the seeded value (start from an
    // empty buffer); after that, keys append/edit normally.
    const base = pristine ? '' : buf;
    const next = applyKey(base, key, integerOnly);
    setBuf(next);
    if (pristine) setPristine(false);
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
    // Inline overlay (not a Modal) so the table behind stays scrollable and its
    // cells stay tappable while the keypad is open. `box-none` lets touches in
    // the empty area pass through to the table; only the sheet catches them.
    // No scrim — the table reads at full brightness and stays interactive.
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
      <Animated.View
        // Report the sheet's actual rendered height so the host lifts the
        // active cell clear of the real keypad top (screenH − height).
        onLayout={(e) => onHeight?.(e.nativeEvent.layout.height)}
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
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
        <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 2 }}>
          <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: t.border }} />
        </View>

        {/* header — one compact band: group icon + identity label & hero
              value stacked (left), feed-type selector (right). Single row keeps
              the sheet short; the identity label sits above the value so a long
              feed name in the chip never collides with them. */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
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

          {/* identity label + typed value + prior-entry hint */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontFamily: type.familyBold,
                color: t.inkSoft,
                letterSpacing: 0.2,
              }}
            >
              บ่อ {pondId} · {slotLabel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  lineHeight: 32,
                  fontFamily: type.familyNumBold,
                  color: isInvalid ? CELL_HIGHLIGHT.errorInk : t.ink,
                  letterSpacing: -0.5,
                }}
              >
                {displayValue}
              </Text>
              <Text style={{ fontSize: 13, color: t.inkSoft, fontFamily: type.familySemi }}>
                {g.unit}
              </Text>
            </View>
          </View>

          {/* feed-type selector */}
          {supportsFeedType && cur ? (
            <Tappable
              onPress={() => setPickerOpen(true)}
              style={{
                justifyContent: 'center',
                paddingVertical: 6,
                paddingLeft: 11,
                paddingRight: 10,
                borderRadius: 13,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 9,
                maxWidth: 168,
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
                      lineHeight: 13,
                    }}
                  >
                    {g.title}
                  </Text>
                ) : null}
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: cur.name !== g.title ? 1 : 0,
                    fontSize: 13,
                    fontFamily: type.familyBold,
                    color: t.ink,
                    lineHeight: 17,
                  }}
                >
                  {cur.name}
                </Text>
              </View>
              <Icon.arrowDown size={12} color={t.inkMute} />
            </Tappable>
          ) : null}
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

        {/* keypad — 4 rows × 3 cols. Fixed row height (not flex-fill) so the
              sheet stays as short as its content instead of stretching keys to
              a fraction of the screen. */}
        <View style={{ paddingHorizontal: 12 }}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['.', '0', '⌫'],
          ].map((row, ri) => (
            <View
              key={ri}
              style={{
                height: NUMPAD_KEY_ROW_H,
                flexDirection: 'row',
                gap: 8,
                marginBottom: ri < 3 ? NUMPAD_KEY_ROW_GAP : 0,
              }}
            >
              {row.map((k) => (
                <NumKey
                  key={k}
                  label={k}
                  dim={k === '.' || k === '⌫'}
                  disabled={k === '.' && integerOnly}
                  onPress={() => handleKey(k)}
                />
              ))}
            </View>
          ))}
        </View>

        {/* footer */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 10 + bottomInset,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Tappable
            onPress={handleCancel}
            style={{
              height: 44,
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
          </Tappable>
          <Tappable
            onPress={isLastCell ? handleCommit : handleNext}
            disabled={isInvalid}
            style={{
              flex: 1,
              height: 44,
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
          </Tappable>
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
  );
}
