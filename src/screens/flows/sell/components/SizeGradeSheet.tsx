import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { SheetShell } from '@/components/sheet';
import type { SizeGradeModel } from '@/features/size-grade';

/**
 * Bottom-sheet picker for fish size grades. Tapping a row picks the grade and
 * closes the sheet — single-tap commit, no separate confirm step. The empty
 * state appears when the size-grade catalogue hasn't loaded yet (offline /
 * unauthenticated); product otherwise expects the catalogue to be populated.
 */
export function SizeGradeSheet({
  visible,
  grades,
  selectedId,
  onPick,
  onClose,
}: {
  visible: boolean;
  grades: SizeGradeModel[];
  selectedId: number | null;
  onPick: (gradeId: number) => void;
  onClose: () => void;
}) {
  const { t } = useTheme();
  return (
    <SheetShell visible={visible} onClose={onClose} title="เลือกไซส์ปลา" heightPct={0.72}>
      {grades.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: t.inkMute, fontFamily: type.family }}>
            กำลังโหลดรายการไซส์…
          </Text>
        </View>
      ) : (
        <ScrollView
          delaysContentTouches={false}
          contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {grades.map((g) => {
            const sel = g.id === selectedId;
            return (
              <Tappable
                key={g.id}
                onPress={() => onPick(g.id)}
                feedback="opacity"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  borderRadius: radii.md,
                  backgroundColor: sel ? t.sellSoft : t.surface,
                  borderWidth: 1.5,
                  borderColor: sel ? t.sell : t.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontFamily: sel ? type.familyBold : type.familySemi,
                    fontSize: 15,
                    color: sel ? t.sellInk : t.ink,
                  }}
                >
                  {g.name}
                </Text>
                {sel ? <Icon.check size={18} color={t.sellInk} stroke={2.4} /> : null}
              </Tappable>
            );
          })}
        </ScrollView>
      )}
    </SheetShell>
  );
}
