import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Btn } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { FormInput } from './FormInput';
import { SheetShell } from './SheetShell';

export const WRONG_CURRENT_PASSWORD = 'WRONG_CURRENT_PASSWORD';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (current: string, next: string) => Promise<void> | void;
};

export function ChangePasswordSheet({ visible, onClose, onSubmit }: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentError, setCurrentError] = useState<string | undefined>();

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid =
    current.length > 0 && next.length >= 8 && confirm === next && !submitting;

  const newError = useMemo(() => (tooShort ? tx('profile.password.tooShort') : undefined), [tooShort, tx]);
  const confirmError = useMemo(
    () => (mismatch ? tx('profile.password.mismatch') : undefined),
    [mismatch, tx],
  );

  const onCurrentChange = (v: string) => {
    setCurrent(v);
    if (currentError) setCurrentError(undefined);
  };

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setCurrentError(undefined);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await onSubmit(current, next);
      reset();
      onClose();
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code === WRONG_CURRENT_PASSWORD) {
        setCurrentError(tx('profile.password.wrongCurrent'));
      }
      // Other errors: parent shows a toast/alert; keep the sheet open.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetShell visible={visible} onClose={handleClose} heightPct={0.6}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontFamily: type.familyBold, fontSize: 18, color: t.ink }}>
          {tx('profile.password.title')}
        </Text>
        <Text style={{ fontFamily: type.family, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
          {tx('profile.password.subtitle')}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput
          label={tx('profile.password.current')}
          placeholder={tx('profile.password.current')}
          value={current}
          onChangeText={onCurrentChange}
          passwordToggle
          autoCapitalize="none"
          error={currentError}
        />
        <FormInput
          label={tx('profile.password.new')}
          placeholder={tx('profile.password.new')}
          value={next}
          onChangeText={setNext}
          passwordToggle
          autoCapitalize="none"
          helper={tx('profile.password.helper')}
          error={newError}
        />
        <FormInput
          label={tx('profile.password.confirm')}
          placeholder={tx('profile.password.confirm')}
          value={confirm}
          onChangeText={setConfirm}
          passwordToggle
          autoCapitalize="none"
          error={confirmError}
        />
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 22,
          borderTopWidth: 1,
          borderTopColor: t.border,
          backgroundColor: t.bg,
        }}
      >
        <View style={{ flex: 1 }}>
          <Btn tone="neutral" variant="ghost" size="md" onPress={handleClose} block>
            {tx('profile.account.discard.cancel')}
          </Btn>
        </View>
        <View style={{ flex: 1.4 }}>
          <Btn tone="brand" size="md" onPress={handleSubmit} disabled={!valid} block>
            {submitting ? tx('profile.account.saving') : tx('profile.password.submit')}
          </Btn>
        </View>
      </View>
    </SheetShell>
  );
}
