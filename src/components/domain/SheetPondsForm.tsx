import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Icon } from '@/components/icons';
import { Input, Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import type { CreatePondItem } from '@/features/pond';

/** Matches the server's varchar(100) / max=100 validator on pond names. */
export const POND_NAME_MAX = 100;

/** Rows area cap — beyond this the list scrolls instead of pushing the submit
 *  button off a tall sheet. */
const ROWS_MAX_HEIGHT = 300;

/** The server trims the "บ่อ" display prefix before storing, so "บ่อ 1" and "1"
 *  are the same pond. Normalize identically to catch a duplicate here rather
 *  than losing the whole batch to a 500071. */
export function normalizePondName(raw: string): string {
  return raw
    .trim()
    .replace(/^บ่อ\s*/, '')
    .trim();
}

/** Digits with at most one decimal point — `area` is a decimal (ไร่) server-side.
 *  Guards paste and hardware keyboards, which the numeric keypad doesn't. */
function sanitizeArea(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [head, ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${head ?? ''}.${rest.join('')}` : (head ?? '');
}

type PondRow = { name: string; area: string };

const BLANK_ROW: PondRow = { name: '', area: '' };

type Props = {
  visible: boolean;
  /** Display name of the farm the ponds land in — shown so a chained
   *  create-farm → add-ponds flow makes the target obvious. */
  farmName: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (ponds: CreatePondItem[]) => void;
};

/**
 * Add one or more ponds to a farm. One submit creates the whole batch in a
 * single server transaction, which is also why duplicates are caught here: a
 * rejected batch creates nothing, so the user would lose every row they typed.
 */
export function SheetPondsForm({ visible, farmName, saving = false, onClose, onSubmit }: Props) {
  const { t, mode } = useTheme();
  const [rows, setRows] = useState<PondRow[]>([BLANK_ROW]);
  const [submitted, setSubmitted] = useState(false);

  // Re-seed on the false→true transition — SheetShell keeps children mounted.
  // [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setRows([BLANK_ROW]);
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible]);

  const setRow = useCallback((index: number, patch: Partial<PondRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }, []);

  const addRow = useCallback(() => setRows((prev) => [...prev, BLANK_ROW]), []);

  const removeRow = useCallback((index: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  // Rows with a name are the payload; blank rows are ignored (the user can add
  // a row and change their mind without having to delete it again).
  const named = rows
    .map((r, index) => ({ index, name: normalizePondName(r.name), area: r.area.trim() }))
    .filter((r) => r.name.length > 0);

  const duplicateIndexes = new Set<number>();
  const seen = new Map<string, number>();
  for (const r of named) {
    const prior = seen.get(r.name);
    if (prior != null) {
      duplicateIndexes.add(prior);
      duplicateIndexes.add(r.index);
    } else {
      seen.set(r.name, r.index);
    }
  }

  const badAreaIndexes = new Set(
    named.filter((r) => r.area !== '' && !Number.isFinite(Number(r.area))).map((r) => r.index),
  );

  const problem =
    named.length === 0
      ? 'ใส่ชื่อบ่ออย่างน้อย 1 บ่อ'
      : duplicateIndexes.size > 0
        ? 'ชื่อบ่อซ้ำกัน — แก้ให้ไม่ซ้ำก่อนบันทึก'
        : badAreaIndexes.size > 0
          ? 'พื้นที่ต้องเป็นตัวเลข'
          : null;

  const handleSubmit = () => {
    if (problem) {
      setSubmitted(true);
      return;
    }
    onSubmit(
      named.map((r) => {
        const area = r.area === '' ? undefined : Number(r.area);
        return { name: r.name, ...(area !== undefined ? { area } : {}) };
      }),
    );
  };

  const showErr = submitted;

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} align="center">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
            >
              เพิ่มบ่อ
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: type.sizes.xs,
                color: t.inkMute,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {`เข้าฟาร์ม ${farmName}`}
            </Text>
          </View>
          <Tappable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="ปิด"
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
          </Tappable>
        </Row>
      </View>

      <Row gap={space[2]} style={{ paddingHorizontal: space[5], paddingBottom: 6 }} align="center">
        <Text style={{ flex: 1, fontSize: 12, fontFamily: type.familySemi, color: t.inkSoft }}>
          ชื่อบ่อ
        </Text>
        <Text style={{ width: 104, fontSize: 12, fontFamily: type.familySemi, color: t.inkSoft }}>
          พื้นที่ (ไร่)
        </Text>
        {rows.length > 1 ? <View style={{ width: 36 }} /> : null}
      </Row>

      <ScrollView
        style={{ maxHeight: ROWS_MAX_HEIGHT }}
        contentContainerStyle={{ paddingHorizontal: space[5], gap: space[2] + 2 }}
        keyboardShouldPersistTaps="handled"
      >
        {rows.map((row, index) => {
          const invalidName = showErr && duplicateIndexes.has(index);
          const invalidArea = showErr && badAreaIndexes.has(index);
          return (
            <Row key={index} gap={space[2]} align="center">
              <View style={{ flex: 1, minWidth: 0 }}>
                <Input
                  value={row.name}
                  onChangeText={(s) => setRow(index, { name: s })}
                  placeholder={`บ่อที่ ${index + 1}`}
                  maxLength={POND_NAME_MAX}
                  autoCapitalize="none"
                  containerStyle={{
                    height: 52,
                    ...(invalidName ? { borderColor: t.danger } : null),
                  }}
                />
              </View>
              <View style={{ width: 104 }}>
                <Input
                  value={row.area}
                  onChangeText={(s) => setRow(index, { area: sanitizeArea(s) })}
                  placeholder="—"
                  keyboardType="decimal-pad"
                  containerStyle={{
                    height: 52,
                    ...(invalidArea ? { borderColor: t.danger } : null),
                  }}
                />
              </View>
              {rows.length > 1 ? (
                <Tappable
                  onPress={() => removeRow(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`ลบแถวบ่อที่ ${index + 1}`}
                  hitSlop={6}
                  style={{
                    width: 36,
                    height: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.trash size={18} color={t.inkSoft} />
                </Tappable>
              ) : null}
            </Row>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: space[5], paddingTop: space[3] }}>
        <Tappable
          onPress={addRow}
          accessibilityRole="button"
          style={{
            height: 46,
            borderRadius: radii.md,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: t.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
          }}
        >
          <Icon.plus size={16} color={t.brandInk} />
          <Text style={{ color: t.brandInk, fontFamily: type.familySemi, fontSize: 14 }}>
            เพิ่มอีกบ่อ
          </Text>
        </Tappable>

        {showErr && problem ? (
          <Text
            style={{
              fontSize: 11.5,
              color: t.danger,
              fontFamily: type.familyMedium,
              marginTop: 8,
            }}
          >
            {problem}
          </Text>
        ) : null}

        {/* New ponds land in `maintenance`, so they show as locked in the daily
            log until fish are filled in. Say it here — otherwise the user adds
            ponds, opens the log, and finds every row greyed out. */}
        <Row
          gap={6}
          align="center"
          style={{
            marginTop: space[3],
            padding: space[3],
            borderRadius: radii.md,
            backgroundColor: t.warnSoft,
          }}
        >
          <Icon.info size={14} color={warnInk(mode, t)} />
          <Text
            style={{
              flex: 1,
              fontSize: 11.5,
              lineHeight: 17,
              color: warnInk(mode, t),
              fontFamily: type.family,
            }}
          >
            บ่อใหม่จะเป็นสถานะปิดบ่อ จนกว่าจะเติมปลาเข้าบ่อ
          </Text>
        </Row>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingTop: space[4], paddingBottom: space[2] }}>
        <Row gap={space[2] + 2}>
          <Tappable
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
          </Tappable>
          <Tappable
            onPress={handleSubmit}
            disabled={saving}
            accessibilityRole="button"
            style={{
              flex: 1.6,
              height: 52,
              borderRadius: radii.md,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
              {saving ? 'กำลังเพิ่ม…' : named.length > 1 ? `เพิ่ม ${named.length} บ่อ` : 'เพิ่มบ่อ'}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}
