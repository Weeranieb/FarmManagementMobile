import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Input, Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';

/** Server column is varchar(100) and the bulk-import validator caps names at
 *  100 — match it here so a too-long name fails before the round trip. */
export const FARM_NAME_MAX = 100;

/** The list UI renders farms as "ฟาร์ม {name}", and the server strips the same
 *  prefix before storing. Trim it on input too, so typing "ฟาร์ม 3" doesn't
 *  read back as "ฟาร์ม ฟาร์ม 3" and a duplicate is caught as one. */
export function normalizeFarmName(raw: string): string {
  return raw
    .trim()
    .replace(/^ฟาร์ม\s*/, '')
    .trim();
}

type Props = {
  visible: boolean;
  /** True while the create is in flight — disables + relabels the submit button. */
  saving?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

/**
 * Create a farm. Shown from the Farms tab (header action / empty state) and
 * reached from Home's empty hero, which routes here rather than owning its own
 * copy of the form.
 */
export function SheetFarmForm({ visible, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // SheetShell keeps children mounted inside a Modal, so the useState seed runs
  // once and never re-applies — re-seed on the false→true transition so a
  // reopened sheet starts clean. [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName('');
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible]);

  const cleaned = normalizeFarmName(name);
  const error = cleaned.length === 0 ? tx('sheet.farm.nameRequired') : null;

  const handleSubmit = () => {
    if (error) {
      setSubmitted(true);
      return;
    }
    onSubmit(cleaned);
    // The caller closes this sheet once the create succeeds, so `saving` stays
    // visible until then — don't close optimistically.
  };

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} align="center">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
            >
              {tx('sheet.farm.title')}
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
              {tx('sheet.farm.subtitle')}
            </Text>
          </View>
          <Tappable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={tx('common.close')}
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

      <View style={{ paddingHorizontal: space[5], paddingTop: space[2] }}>
        <Row gap={4} align="center" style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>
            {tx('sheet.farm.nameLabel')}
          </Text>
          <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 13 }}>*</Text>
        </Row>
        <Input
          value={name}
          onChangeText={setName}
          placeholder={tx('sheet.farm.placeholder')}
          maxLength={FARM_NAME_MAX}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          containerStyle={submitted && error ? { borderColor: t.danger } : undefined}
        />
        <Text
          style={{
            fontSize: 11.5,
            color: submitted && error ? t.danger : t.inkMute,
            fontFamily: submitted && error ? type.familyMedium : type.family,
            marginTop: 4,
          }}
        >
          {submitted && error ? error : tx('sheet.farm.hint')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingTop: space[5], paddingBottom: space[2] }}>
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
            <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>
              {tx('common.cancel')}
            </Text>
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
              {saving ? tx('sheet.farm.submitting') : tx('sheet.farm.title')}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}
