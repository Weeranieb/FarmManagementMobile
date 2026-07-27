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
import { UserLevel } from '@/features/auth';
import type { UserResponse } from '@/features/auth';
import { WORKER_LIMITS, hasWorkerFormErrors, validateWorkerForm } from '../validation';

export type WorkerFormPayload = {
  username: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  contactNumber: string;
  userLevel: number;
  /** Add mode only. */
  password?: string;
};

type Props = {
  visible: boolean;
  /** Non-null → edit mode. Null → add mode. */
  editing?: UserResponse | null;
  /** True when `editing` is the signed-in admin. Their own role is locked: a
   *  self-demotion to worker would take away this very screen mid-session. */
  editingSelf?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: WorkerFormPayload) => void;
};

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12.5, fontFamily: type.familySemi, color: t.ink }}>{label}</Text>
      {children}
      {error || hint ? (
        <Text
          style={{
            fontSize: 11.5,
            lineHeight: 16,
            fontFamily: error ? type.familyMedium : type.family,
            color: error ? t.danger : t.inkMute,
          }}
        >
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  );
}

export function SheetWorkerForm({
  visible,
  editing,
  editingSelf = false,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const isEdit = editing != null;

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userLevel, setUserLevel] = useState<number>(UserLevel.Normal);
  const [submitted, setSubmitted] = useState(false);

  // SheetShell keeps children mounted, so seed on the false→true transition.
  // [[project_sheetshell_stale_state]]
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setUsername(editing?.username ?? '');
      setFirstName(editing?.firstName ?? '');
      setLastName(editing?.lastName ?? '');
      setEmail(editing?.email ?? '');
      setContactNumber(editing?.contactNumber ?? '');
      setUserLevel(editing?.userLevel ?? UserLevel.Normal);
      setPassword('');
      setSubmitted(false);
    }
    wasVisible.current = visible;
  }, [visible, editing]);

  const values = { username, firstName, lastName, email, contactNumber, password };
  const errors = validateWorkerForm(values, !isEdit);
  const err = (k: keyof typeof errors) =>
    submitted && errors[k] ? tx(errors[k] as string) : undefined;

  const handleSubmit = () => {
    if (hasWorkerFormErrors(errors)) {
      setSubmitted(true);
      return;
    }
    onSubmit({
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim() || null,
      email: email.trim() || null,
      contactNumber: contactNumber.replace(/\D/g, ''),
      userLevel,
      ...(isEdit ? {} : { password }),
    });
  };

  return (
    <SheetShell visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[2] }}>
        <Row gap={space[3]} align="center">
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontFamily: type.familyBold, fontSize: type.sizes.lg, color: t.ink }}
          >
            {isEdit ? tx('workers.form.editTitle') : tx('workers.form.addTitle')}
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

      <View style={{ paddingHorizontal: space[5], paddingTop: space[2], gap: space[3] + 2 }}>
        <Field label={tx('workers.form.firstName')} error={err('firstName')}>
          <MInput
            value={firstName}
            onChangeText={setFirstName}
            maxLength={WORKER_LIMITS.name}
            invalid={!!err('firstName')}
          />
        </Field>
        <Field label={tx('workers.form.lastName')}>
          <MInput value={lastName} onChangeText={setLastName} maxLength={WORKER_LIMITS.name} />
        </Field>
        <Field
          label={tx('workers.form.username')}
          error={err('username')}
          hint={tx('workers.form.usernameHint')}
        >
          <MInput
            value={username}
            onChangeText={(s) => setUsername(s.toLowerCase())}
            autoCapitalize="none"
            maxLength={WORKER_LIMITS.username}
            invalid={!!err('username')}
          />
        </Field>
        <Field label={tx('workers.form.contact')} error={err('contactNumber')}>
          <MInput
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            digitsOnly
            maxLength={WORKER_LIMITS.contact}
            invalid={!!err('contactNumber')}
          />
        </Field>
        <Field label={tx('workers.form.email')} error={err('email')}>
          <MInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            maxLength={WORKER_LIMITS.email}
            invalid={!!err('email')}
          />
        </Field>

        {!isEdit ? (
          <Field
            label={tx('workers.form.password')}
            error={err('password')}
            hint={tx('workers.form.passwordHint')}
          >
            <MInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              invalid={!!err('password')}
            />
          </Field>
        ) : null}

        {/* Role. Locked on your own row — demoting yourself would remove this
            screen from under you, and the server would happily do it. */}
        <Field
          label={tx('workers.form.role')}
          hint={editingSelf ? tx('workers.form.roleSelfLocked') : tx('workers.form.roleHint')}
        >
          <Row gap={space[2]}>
            {[UserLevel.Normal, UserLevel.ClientAdmin].map((lvl) => {
              const sel = userLevel === lvl;
              const disabled = editingSelf;
              return (
                <View
                  key={lvl}
                  style={{
                    flex: 1,
                    borderRadius: radii.md,
                    backgroundColor: sel ? t.brandSoft : t.surface,
                    borderWidth: 1.5,
                    borderColor: sel ? t.brand : t.border,
                    opacity: disabled && !sel ? 0.45 : 1,
                    overflow: 'hidden',
                  }}
                >
                  <Tappable
                    feedback="opacity"
                    onPress={() => !disabled && setUserLevel(lvl)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel, disabled }}
                    style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text
                      style={{
                        fontSize: type.sizes.sm,
                        fontFamily: sel ? type.familyBold : type.familyMedium,
                        color: sel ? t.brandInk : t.inkSoft,
                      }}
                    >
                      {lvl === UserLevel.Normal
                        ? tx('workers.role.worker')
                        : tx('workers.role.owner')}
                    </Text>
                  </Tappable>
                </View>
              );
            })}
          </Row>
        </Field>
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
