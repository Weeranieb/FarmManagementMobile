import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { thaiDate } from '@/locale/thaiDate';
import { clampDate, InlineThaiCalendar } from './InlineThaiCalendar';

type Props = {
  value: Date;
  onChange: (next: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  /** Danger treatment (red border + icon) — e.g. the chosen date collides with
   *  another entry and the caller is blocking the save. */
  warn?: boolean;
};

/** Imperative handle — lets a caller pop the calendar open (e.g. a
 *  "เลือกวันอื่น" action next to a date-collision warning). */
export type DateFieldHandle = { open: () => void };

/** Bottom sheet height as a fraction of the screen — tall enough to sit above the home indicator. */
const SHEET_HEIGHT_PCT = 0.58;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Interactive date picker control — shows the chosen date in a button-styled
 * row, and on tap opens a custom Thai (Buddhist-era) calendar in a bottom sheet
 * with a "เสร็จ" confirm button. The same sheet is used on both iOS and Android
 * so the date UX (and พ.ศ. year) is identical across platforms — Android no
 * longer falls back to the OS-native Gregorian dialog. Defaults to today as
 * maximum (no future dates).
 */
export const DateField = forwardRef<DateFieldHandle, Props>(function DateField(
  { value, onChange, minimumDate, maximumDate, warn = false },
  ref,
) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetHeight = Dimensions.get('window').height * SHEET_HEIGHT_PCT;
  const maxDate = useMemo(() => maximumDate ?? startOfToday(), [maximumDate]);
  const [open, setOpen] = useState(false);
  // The calendar edits a draft date so the user can confirm with "เสร็จ".
  const [draft, setDraft] = useState<Date>(value);

  const openPicker = () => {
    setDraft(clampDate(value, minimumDate, maxDate));
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({ open: openPicker }));

  const confirmPick = () => {
    onChange(clampDate(draft, minimumDate, maxDate));
    setOpen(false);
  };

  const handleDraftChange = (next: Date) => {
    setDraft(clampDate(next, minimumDate, maxDate));
  };

  return (
    <>
      <Tappable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel="เลือกวันที่"
        style={{
          height: 52,
          borderRadius: radii.md,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: warn ? t.danger : t.border,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Icon.calendar size={18} color={warn ? t.danger : t.inkSoft} />
        <Text style={{ fontSize: 15, color: t.ink, fontFamily: type.family, flex: 1 }}>
          {thaiDate.long(value)}
        </Text>
        <Icon.chevR size={16} color={t.inkSoft} />
      </Tappable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityLabel="ยกเลิก"
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.40)' }]}
            />
            <View
              style={{
                width: '100%',
                height: sheetHeight,
                backgroundColor: t.bg,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
                paddingBottom: Math.max(insets.bottom, 12),
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
                <View
                  style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.border }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  paddingBottom: 8,
                }}
              >
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <Tappable onPress={() => setOpen(false)} hitSlop={10}>
                    <Text style={{ color: t.inkSoft, fontFamily: type.familyMedium, fontSize: 15 }}>
                      ยกเลิก
                    </Text>
                  </Tappable>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: type.familyBold, fontSize: 15, color: t.ink }}>
                    เลือกวันที่
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Tappable onPress={confirmPick} hitSlop={10}>
                    <Text style={{ color: t.brand, fontFamily: type.familyBold, fontSize: 15 }}>
                      เสร็จ
                    </Text>
                  </Tappable>
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                <InlineThaiCalendar
                  value={draft}
                  onChange={handleDraftChange}
                  minimumDate={minimumDate}
                  maximumDate={maxDate}
                />
              </View>
            </View>
          </View>
        </Modal>
    </>
  );
});
