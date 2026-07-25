import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { VIBRANT_BRAND, type GroupKey } from '../constants';

type Props = {
  visible: boolean;
  group: GroupKey;
  feeds: FeedCollectionModel[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  isLoading?: boolean;
  isError?: boolean;
};

// Calm/desaturated brand swatches per group — the design uses fixed
// per-brand swatches (CP blue, โปรฟีด green, etc.) but our backend doesn't
// carry brand metadata, so we collapse to a group-level swatch.
const BRAND_DOT: Record<GroupKey, { dot: string; tintA: string }> = {
  pellet: { dot: '#5478c2', tintA: '#eaf0fb' },
  fresh: { dot: '#5ca070', tintA: '#ebf4ee' },
  death: { dot: '#d18654', tintA: '#faeee2' },
  catch: { dot: '#6c8aa8', tintA: '#eaf0f6' },
};

function formatDetail(f: FeedCollectionModel): string {
  if (f.price == null) return f.unit ?? 'กก.';
  return `฿${f.price}/${f.unit || 'กก.'}`;
}

export function FeedTypePicker({
  visible,
  group,
  feeds,
  selectedId,
  onSelect,
  onClose,
  isLoading,
  isError,
}: Props) {
  const { t } = useTheme();
  const [search, setSearch] = useState('');

  const swatch = BRAND_DOT[group];
  const withSearch = feeds.length > 6;
  const q = search.trim().toLowerCase();
  const visibleFeeds = useMemo(
    () => (q ? feeds.filter((f) => f.name.toLowerCase().includes(q)) : feeds),
    [feeds, q],
  );

  if (!visible) return null;

  return (
    <>
      {/* Scrim — dims the keypad sheet only; tap-outside dismisses */}
      <Animated.View
        entering={FadeIn.duration(120)}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: 'rgba(15,23,42,.22)',
          zIndex: 70,
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            setSearch('');
            onClose();
          }}
          accessibilityLabel="ปิดตัวเลือกอาหาร"
        />
      </Animated.View>

      {/* Panel — anchored top-right under the chip, 264px wide */}
      <Animated.View
        entering={FadeIn.duration(150)}
        style={{
          position: 'absolute',
          top: 58,
          right: 14,
          width: 264,
          zIndex: 80,
          backgroundColor: t.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: t.border,
          overflow: 'hidden',
          shadowColor: '#0b1220',
          shadowOpacity: 0.28,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 14 },
          elevation: 22,
        }}
      >
        {/* Tiny pointer arrow toward the chip */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -6,
            right: 28,
            width: 12,
            height: 12,
            backgroundColor: t.surface,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor: t.border,
            transform: [{ rotate: '45deg' }],
            zIndex: 1,
          }}
        />

        {/* Header — muted Thai label */}
        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 11,
            paddingBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: type.familySemi,
              color: t.inkSoft,
              letterSpacing: 0.1,
            }}
          >
            เลือกอาหาร
          </Text>
        </View>

        {/* Search field — only shown when feed list is long enough to warrant it */}
        {withSearch ? (
          <View style={{ paddingHorizontal: 12, paddingTop: 2, paddingBottom: 8 }}>
            <View
              style={{
                height: 34,
                borderRadius: 10,
                backgroundColor: q ? t.surface : t.surfaceAlt,
                borderWidth: q ? 1.5 : 1,
                borderColor: q ? VIBRANT_BRAND[500] : t.border,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                gap: 8,
              }}
            >
              <Icon.search size={13} color={t.inkMute} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="ค้นหาอาหาร"
                placeholderTextColor={t.inkMute}
                style={{
                  flex: 1,
                  fontFamily: type.familySemi,
                  fontSize: 13,
                  color: t.ink,
                  paddingVertical: 0,
                }}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {q ? (
                <Tappable
                  onPress={() => setSearch('')}
                  hitSlop={6}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: t.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="ล้างคำค้นหา"
                >
                  <Icon.x size={10} color="#fff" />
                </Tappable>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* List */}
        <ScrollView
          delaysContentTouches={false}
          style={{ maxHeight: 280 }}
          contentContainerStyle={{ paddingTop: 2, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: t.inkSoft, fontSize: 12.5 }}>กำลังโหลด…</Text>
            </View>
          ) : isError ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: t.danger, fontSize: 12.5 }}>โหลดข้อมูลไม่สำเร็จ</Text>
            </View>
          ) : visibleFeeds.length === 0 ? (
            <View style={{ paddingHorizontal: 14, paddingVertical: 24 }}>
              <Text style={{ color: t.inkMute, fontSize: 12.5, textAlign: 'center' }}>
                {q ? `ไม่พบอาหารที่ตรงกับ "${search}"` : 'ยังไม่มีชนิดอาหารนี้'}
              </Text>
            </View>
          ) : (
            visibleFeeds.map((f) => {
              const sel = f.id === selectedId;
              return (
                <Tappable
                  key={f.id}
                  feedback="opacity"
                  onPress={() => {
                    onSelect(f.id);
                    setSearch('');
                    onClose();
                  }}
                  style={{
                    minHeight: 56,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    backgroundColor: sel ? swatch.tintA : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={f.name}
                >
                  {/* Calm brand color dot */}
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: swatch.dot,
                    }}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: type.familyMedium,
                        color: t.ink,
                        letterSpacing: 0.05,
                      }}
                      numberOfLines={1}
                    >
                      {f.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: t.inkSoft,
                        marginTop: 2,
                        lineHeight: 16,
                      }}
                      numberOfLines={1}
                    >
                      {formatDetail(f)}
                    </Text>
                  </View>
                  {sel ? (
                    <Icon.check size={16} color={t.ink} />
                  ) : null}
                </Tappable>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}
