import { useMemo, useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { thaiDate } from '@/locale/thaiDate';
import { clampDate, InlineThaiCalendar } from './InlineThaiCalendar';

type Props = {
  value: Date;
  onChange: (next: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

/** Bottom sheet height as a fraction of the screen — tall enough to sit above the home indicator. */
const SHEET_HEIGHT_PCT = 0.58;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Interactive date picker control — shows the chosen date in a button-styled
 * row, opens the native picker on tap (Android dialog, iOS custom calendar in a
 * bottom sheet with a "เสร็จ" confirm button). Defaults to today as maximum (no future dates).
 */
export function DateField({ value, onChange, minimumDate, maximumDate }: Props) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetHeight = Dimensions.get('window').height * SHEET_HEIGHT_PCT;
  const maxDate = useMemo(() => maximumDate ?? startOfToday(), [maximumDate]);
  const [open, setOpen] = useState(false);
  // iOS calendar edits a draft date so the user can confirm with "เสร็จ".
  const [draft, setDraft] = useState<Date>(value);

  const openPicker = () => {
    setDraft(clampDate(value, minimumDate, maxDate));
    setOpen(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === 'set' && selected) {
      onChange(clampDate(selected, minimumDate, maxDate));
    }
  };

  const confirmIos = () => {
    onChange(clampDate(draft, minimumDate, maxDate));
    setOpen(false);
  };

  const handleDraftChange = (next: Date) => {
    setDraft(clampDate(next, minimumDate, maxDate));
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel="เลือกวันที่"
        style={{
          height: 52,
          borderRadius: radii.md,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: t.border,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Icon.calendar size={18} color={t.inkSoft} />
        <Text style={{ fontSize: 15, color: t.ink, fontFamily: type.family, flex: 1 }}>
          {thaiDate.long(value)}
        </Text>
        <Icon.chevR size={16} color={t.inkSoft} />
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={clampDate(value, minimumDate, maxDate)}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maxDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
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
                  <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                    <Text style={{ color: t.inkSoft, fontFamily: type.familyMedium, fontSize: 15 }}>
                      ยกเลิก
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: type.familyBold, fontSize: 15, color: t.ink }}>
                    เลือกวันที่
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Pressable onPress={confirmIos} hitSlop={10}>
                    <Text style={{ color: t.brand, fontFamily: type.familyBold, fontSize: 15 }}>
                      เสร็จ
                    </Text>
                  </Pressable>
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
      ) : null}
    </>
  );
}
