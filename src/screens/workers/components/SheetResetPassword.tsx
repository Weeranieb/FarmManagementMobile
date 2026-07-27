import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import { MInput } from '@/screens/merchants/components/MInput';
import { passwordErrorKey } from '@/features/auth';
import type { UserResponse } from '@/features/auth';

type Props = {
  visible: boolean;
  worker: UserResponse | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

/**
 * Admin password reset. Deliberately does NOT ask for the target's current
 * password — that is the point of an admin reset, and an owner resetting a
 * worker who forgot theirs would have nothing to type.
 *
 * The new password is shown in clear text: whoever runs this has to read it out
 * to the worker, and masking it would only invite typos in a value nobody can
 * recover afterwards.
 */
export function SheetResetPassword({ visible, worker, saving = false, onClose, onSubmit }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setPassword('');
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible]);

  const errKey = passwordErrorKey(password);
  const showErr = submitted && errKey != null;

  const handleSubmit = () => {
    if (errKey) {
      setSubmitted(true);
      return;
    }
    onSubmit(password);
  };

  const fullName = worker ? `${worker.firstName} ${worker.lastName ?? ''}`.trim() : '';

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[2] }}>
        <Row gap={space[3]} align="center">
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
          >
            {tx('workers.reset.title')}
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
        <Text
          style={{
            fontSize: type.sizes.sm,
            color: t.inkMute,
            fontFamily: type.family,
            marginTop: 4,
          }}
        >
          {tx('workers.reset.body', { name: fullName || worker?.username || '' })}
        </Text>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingTop: space[3], gap: 6 }}>
        <Text style={{ fontSize: 12.5, fontFamily: type.familySemi, color: t.ink }}>
          {tx('workers.reset.newPassword')}
        </Text>
        <MInput
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          invalid={showErr}
        />
        <Text
          style={{
            fontSize: 11.5,
            lineHeight: 16,
            fontFamily: showErr ? type.familyMedium : type.family,
            color: showErr ? t.danger : t.inkMute,
          }}
        >
          {showErr ? tx(errKey as string) : tx('workers.reset.hint')}
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
              {saving ? tx('common.saving') : tx('workers.reset.confirm')}
            </Text>
          </Tappable>
        </Row>
      </View>
    </SheetShell>
  );
}
