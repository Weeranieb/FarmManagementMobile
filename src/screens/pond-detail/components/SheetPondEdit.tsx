import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Input, Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import { normalizePondName, POND_NAME_MAX } from '@/components/domain/SheetPondsForm';
import type { PondModel } from '@/features/pond';

export type PondEditPayload = { name: string; area?: number };

type Props = {
  visible: boolean;
  pond: PondModel | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: PondEditPayload) => void;
};

/** Digits with at most one decimal point — mirrors the create form's sanitizer. */
function sanitizeArea(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [head, ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${head ?? ''}.${rest.join('')}` : (head ?? '');
}

/**
 * Rename a pond / set its area. Deliberately does NOT edit status — a pond's
 * status is either derived from its cycle (fill, sell, move) or toggled from
 * the actions sheet, which can explain the consequences. Burying it in a form
 * field would make "close this pond" look like a typo-level edit.
 */
export function SheetPondEdit({ visible, pond, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // SheetShell keeps children mounted, so seed on the false→true transition.
  // [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setName(pond?.name ?? '');
      setArea(pond?.area != null ? String(pond.area) : '');
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible, pond]);

  const cleaned = normalizePondName(name);
  const areaTrimmed = area.trim();
  const areaInvalid = areaTrimmed !== '' && !Number.isFinite(Number(areaTrimmed));
  const error = cleaned.length === 0
    ? tx('pondDetail.edit.nameRequired')
    : areaInvalid
      ? tx('pondDetail.edit.areaNotNumber')
      : null;

  const handleSubmit = () => {
    if (error) {
      setSubmitted(true);
      return;
    }
    onSubmit({
      name: cleaned,
      ...(areaTrimmed === '' ? {} : { area: Number(areaTrimmed) }),
    });
  };

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} align="center">
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: type.familyBold,
              fontSize: type.sizes.lg,
              color: t.ink,
            }}
          >
            {tx('pondDetail.edit.title')}
          </Text>
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

      <View style={{ paddingHorizontal: space[5], paddingTop: space[2], gap: space[4] }}>
        <View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: type.familySemi,
              color: t.ink,
              marginBottom: 6,
            }}
          >
            {tx('pondDetail.edit.nameLabel')}
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            maxLength={POND_NAME_MAX}
            autoCapitalize="none"
            containerStyle={submitted && cleaned.length === 0 ? { borderColor: t.danger } : undefined}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: type.familySemi,
              color: t.ink,
              marginBottom: 6,
            }}
          >
            {tx('pondDetail.edit.areaLabel')}
          </Text>
          <Input
            value={area}
            onChangeText={(s) => setArea(sanitizeArea(s))}
            keyboardType="decimal-pad"
            placeholder="—"
            containerStyle={submitted && areaInvalid ? { borderColor: t.danger } : undefined}
          />
          <Text
            style={{
              fontSize: 11.5,
              color: submitted && error ? t.danger : t.inkMute,
              fontFamily: submitted && error ? type.familyMedium : type.family,
              marginTop: 4,
            }}
          >
            {submitted && error ? error : tx('pondDetail.edit.areaHint')}
          </Text>
        </View>
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
              {saving ? tx('common.saving') : tx('common.save')}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}
