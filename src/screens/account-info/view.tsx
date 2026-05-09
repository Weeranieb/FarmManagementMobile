import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Pill, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Avatar } from './components/Avatar';
import { ChangePasswordSheet } from './components/ChangePasswordSheet';
import { DiscardDialog } from './components/DiscardDialog';
import { FormInput } from './components/FormInput';
import { SectionLabel } from './components/SectionLabel';
import type { useAccountInfoForm } from './hook';

type Props = ReturnType<typeof useAccountInfoForm>;

export function AccountInfoView({
  form,
  errors,
  saving,
  canSave,
  setField,
  handleSave,
  handleBack,
  showPasswordSheet,
  openPasswordSheet,
  closePasswordSheet,
  handleSubmitPassword,
  showDiscardDialog,
  handleCancelDiscard,
  handleConfirmDiscard,
}: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();

  const initial = (form.firstName?.[0] || form.username?.[0] || '–').toUpperCase();
  const displayName = `${form.firstName || '—'} ${form.lastName || ''}`.trim();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={tx('profile.account.title')}
        leading={
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.back size={22} color={t.ink} />
          </Pressable>
        }
        trailing={
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            hitSlop={8}
            style={{
              paddingHorizontal: 6,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text
              style={{
                color: canSave ? t.brand : t.inkMute,
                fontFamily: type.familySemi,
                fontSize: 15,
              }}
            >
              {saving ? tx('profile.account.saving') : tx('profile.account.save')}
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: 24, paddingBottom: 8, alignItems: 'center' }}>
          <Avatar initial={initial} name={displayName} />
        </View>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Pill tone="brand" style={{ alignSelf: 'center' }}>
            {tx('profile.ownerLabel')}
          </Pill>
        </View>

        <SectionLabel>{tx('profile.account.section.personal')}</SectionLabel>
        <View style={{ paddingHorizontal: 20 }}>
          <Card>
            <View style={{ gap: 14 }}>
              <FormInput
                label={tx('profile.account.field.firstName')}
                placeholder={tx('profile.account.placeholder.firstName')}
                value={form.firstName}
                onChangeText={setField('firstName')}
                error={errors.firstName}
                required
              />
              <FormInput
                label={tx('profile.account.field.lastName')}
                placeholder={tx('profile.account.placeholder.lastName')}
                value={form.lastName}
                onChangeText={setField('lastName')}
              />
              <FormInput
                label={tx('profile.account.field.username')}
                placeholder={tx('profile.account.placeholder.username')}
                value={form.username}
                onChangeText={setField('username')}
                error={errors.username}
                autoCapitalize="none"
                monospace
                required
              />
              <FormInput
                label={tx('profile.account.field.email')}
                placeholder={tx('profile.account.placeholder.email')}
                value={form.email}
                onChangeText={setField('email')}
                error={errors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                monospace
              />
              <FormInput
                label={tx('profile.account.field.contact')}
                placeholder={tx('profile.account.placeholder.contact')}
                value={form.contactNumber}
                onChangeText={setField('contactNumber')}
                error={errors.contactNumber}
                keyboardType="phone-pad"
                monospace
              />
            </View>
          </Card>
        </View>

        <SectionLabel>{tx('profile.account.section.security')}</SectionLabel>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Card padded={false}>
            <Pressable
              onPress={openPasswordSheet}
              android_ripple={{ color: t.surfaceAlt }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: t.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.lock size={18} color={t.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: type.familySemi, fontSize: 14, color: t.ink }}>
                  {tx('profile.account.changePassword')}
                </Text>
                <Text
                  style={{ fontFamily: type.family, fontSize: 12, color: t.inkMute, marginTop: 2 }}
                >
                  {tx('profile.account.changePasswordSub', { date: '12 ก.พ. 2569' })}
                </Text>
              </View>
              <Icon.chevR size={16} color={t.inkSoft} />
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      <ChangePasswordSheet
        visible={showPasswordSheet}
        onClose={closePasswordSheet}
        onSubmit={handleSubmitPassword}
      />
      <DiscardDialog
        visible={showDiscardDialog}
        onCancel={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
      />
    </View>
  );
}
