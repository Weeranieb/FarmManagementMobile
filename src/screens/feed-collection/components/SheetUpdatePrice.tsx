import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { SheetShell } from '@/screens/account-info/components/SheetShell';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { feedPaletteFor } from '../feedPalette';
import { DateField } from '@/components/date-selector';
import { feedGlyphFor } from './FeedIcons';

type Props = {
  visible: boolean;
  feed: FeedCollectionModel | null;
  onClose: () => void;
  onSubmit?: (payload: { id: number; price: number; effectiveDate: string }) => void;
};

export function SheetUpdatePrice({ visible, feed, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const currentPrice = feed?.price ?? null;
  const [next, setNext] = useState(currentPrice != null ? String(currentPrice + 2) : '');
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());

  const diff = useMemo(() => {
    if (currentPrice == null) return null;
    const n = Number(next);
    if (!Number.isFinite(n)) return null;
    const delta = n - currentPrice;
    const pct = currentPrice === 0 ? 0 : (delta / currentPrice) * 100;
    return { delta, pct };
  }, [currentPrice, next]);

  // Modal keeps this sheet mounted, so the useState seeds run only once. Re-seed
  // from the current feed on each open — otherwise reopening for a different
  // feed shows the previous feed's suggested price and date.
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setNext(currentPrice != null ? String(currentPrice + 2) : '');
      setEffectiveDate(new Date());
    }
    wasVisible.current = visible;
  }, [visible, currentPrice]);

  if (!feed) {
    return (
      <SheetShell visible={visible} onClose={onClose} heightPct={0.6}>
        {null}
      </SheetShell>
    );
  }

  const palette = feedPaletteFor(feed.kind);
  const Glyph = feedGlyphFor(feed.kind);

  const handleSubmit = () => {
    const n = Number(next);
    const fallback = currentPrice ?? 0;
    onSubmit?.({
      id: feed.id,
      price: Number.isFinite(n) ? n : fallback,
      effectiveDate: toYmd(effectiveDate),
    });
    onClose();
  };

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.72}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
        <Row justify="space-between">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: type.familyBold, fontSize: 18, color: t.ink }}>
              อัปเดตราคา
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}
            >
              {feed.name}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.x size={18} color={t.ink} />
          </Pressable>
        </Row>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <View
          style={{
            padding: 12,
            borderRadius: radii.md,
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderColor: t.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: palette.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={20} stroke={2} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: t.inkMute,
                fontFamily: type.familySemi,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              ราคาปัจจุบัน
            </Text>
            <Row gap={6} style={{ alignItems: 'baseline', marginTop: 2 }}>
              {currentPrice != null ? (
                <>
                  <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>
                    {fmt.baht(currentPrice)}
                  </Text>
                  <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.family }}>
                    /{feed.unit}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: t.inkMute,
                      fontFamily: type.family,
                      marginLeft: 4,
                    }}
                  >
                    · อัปเดต {thaiDate.short(new Date(feed.updatedAt))}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 13, color: t.inkMute, fontFamily: type.family }}>
                  ยังไม่มีประวัติราคา
                </Text>
              )}
            </Row>
          </View>
        </View>

        <Field label="ราคาใหม่">
          <PriceInput value={next} onChangeText={setNext} suffix={`฿/${feed.unit}`} />
        </Field>

        <Field label="วันที่มีผล">
          <DateField value={effectiveDate} onChange={setEffectiveDate} />
        </Field>

        {diff ? <DiffHint delta={diff.delta} pct={diff.pct} /> : null}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 }}>
        <Row gap={10}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 52,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>ยกเลิก</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            accessibilityRole="button"
            style={{
              flex: 1.6,
              height: 52,
              borderRadius: radii.md,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
              บันทึกราคาใหม่
            </Text>
          </Pressable>
        </Row>
      </View>
    </SheetShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>{label}</Text>
        <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 13 }}>*</Text>
      </View>
      {children}
    </View>
  );
}

function PriceInput({
  value,
  onChangeText,
  suffix,
}: {
  value: string;
  onChangeText: (s: string) => void;
  suffix: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: 52,
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={t.inkMute}
        style={{
          flex: 1,
          color: t.ink,
          fontFamily: type.familyNumBold,
          fontSize: 22,
          letterSpacing: -0.3,
          paddingVertical: 0,
        }}
      />
      <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.familyNum }}>{suffix}</Text>
    </View>
  );
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function DiffHint({ delta, pct }: { delta: number; pct: number }) {
  const { t } = useTheme();
  const positive = delta >= 0;
  const tone = positive ? t.statusActive : t.danger;
  const soft = positive ? t.statusActiveSoft : t.dangerSoft;
  const sign = positive ? '+' : '−';
  return (
    <View
      style={{
        padding: 10,
        borderRadius: radii.sm,
        backgroundColor: soft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon.arrow size={14} color={tone} />
      <Text style={{ color: tone, fontSize: 12, fontFamily: type.family }}>เปลี่ยนแปลง</Text>
      <Text style={{ color: tone, fontSize: 12, fontFamily: type.familyNumBold }}>
        {sign}฿{Math.abs(delta).toFixed(2)}
      </Text>
      <Text style={{ color: tone, fontSize: 12, fontFamily: type.familyNum }}>
        · {Math.abs(pct).toFixed(1)}%
      </Text>
    </View>
  );
}
