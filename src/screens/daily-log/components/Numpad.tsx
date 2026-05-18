import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, View, Text, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedCollectionsData } from '@/features/feed-collection';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { COLS, GROUP_LIGHT, VIBRANT_BRAND, fmtTh, type ColKey, type GroupKey } from '../constants';
import { FeedTypePicker } from './FeedTypePicker';
import { GroupIcon } from './GroupIcon';

type Props = {
  visible: boolean;
  pondId: string;
  col: ColKey;
  initialValue: number | '';
  yesterday?: number | null;
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
  onCancel,
  onCommit,
  onNext,
}: Props) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
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

  // Default to the first available feed when the list arrives or the column
  // changes — preserves the currently selected feed if it's still in the list.
  useEffect(() => {
    if (!supportsFeedType) {
      setSelectedFeedId(null);
      return;
    }
    if (selectedFeedId != null && feeds.some((f) => f.id === selectedFeedId)) return;
    setSelectedFeedId(feeds[0]?.id ?? null);
  }, [feeds, supportsFeedType, selectedFeedId]);

  useEffect(() => {
    if (visible) {
      setBuf(initialValue === '' || initialValue == null ? '' : String(initialValue));
      setPickerOpen(false);
    }
  }, [visible, initialValue, pondId, col]);

  const displayValue = useMemo(() => (buf === '' ? '0' : buf), [buf]);
  const screenH = Dimensions.get('window').height;
  // Grow the sheet to cover the home-indicator inset so the footer keeps its
  // designed proportions and still clears the device safe area.
  const sheetH = Math.round(screenH * 0.52) + insets.bottom;

  if (!visible) return null;

  const handleKey = (key: string) => {
    setBuf((prev) => applyKey(prev, key, integerOnly));
  };

  const handleCancel = () => {
    onCancel();
  };
  const handleNext = () => {
    onNext(parseValue(buf), supportsFeedType ? selectedFeedId : null);
  };

  const cur = supportsFeedType ? (feeds.find((f) => f.id === selectedFeedId) ?? null) : null;
  // Calm/desaturated brand swatch — same calibration as FeedTypePicker rows.
  const chipDot =
    group === 'fresh'
      ? { dot: '#5ca070', tintA: '#ebf4ee' }
      : { dot: '#5478c2', tintA: '#eaf0fb' };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleCancel}>
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(120)}
          style={{ flex: 1, backgroundColor: 'rgba(11,18,32,.25)' }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => onCommit(parseValue(buf), supportsFeedType ? selectedFeedId : null)}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(220)}
          style={{
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
          }}
        >
          {/* grabber */}
          <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 3 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: t.border }} />
          </View>

          {/* feed type chip — top right · 2-line tile (eyebrow + feed name) */}
          {supportsFeedType && cur ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={{
                position: 'absolute',
                top: 6,
                right: 14,
                paddingTop: 6,
                paddingBottom: 7,
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
                zIndex: 5,
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
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 2,
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

          {/* header: context + value */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 10,
              paddingRight: supportsFeedType ? 200 : 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
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
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: type.familyBold,
                  color: t.inkSoft,
                  letterSpacing: 0.2,
                }}
                numberOfLines={1}
              >
                บ่อ {pondId} · {slotLabel}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text
                  style={{
                    fontSize: 34,
                    lineHeight: 36,
                    fontFamily: type.familyNumBold,
                    color: t.ink,
                    letterSpacing: -1,
                  }}
                >
                  {displayValue}
                </Text>
                <Text style={{ fontSize: 14, color: t.inkSoft, fontFamily: type.familySemi }}>
                  {g.unit}
                </Text>
                {yesterday != null ? (
                  <Text style={{ fontSize: 12, color: t.inkSoft, marginLeft: 8 }}>
                    เดิม{' '}
                    <Text style={{ fontFamily: type.familyNumBold, color: t.inkSoft }}>
                      {fmtTh(yesterday)}
                    </Text>
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

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
              paddingBottom: 12 + insets.bottom,
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
              onPress={handleNext}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 13,
                backgroundColor: VIBRANT_BRAND[600],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontFamily: type.familyBold, fontSize: 15, color: '#fff' }}>
                ถัดไป
              </Text>
              <Icon.chevR size={16} color="#fff" />
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
