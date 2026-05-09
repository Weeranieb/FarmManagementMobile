import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DiscardDialog({ visible, onCancel, onConfirm }: Props) {
  const { t: tx } = useTranslation();
  const { t, shadowLg } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              width: '100%',
              maxWidth: 320,
              backgroundColor: t.surface,
              borderRadius: radii.lg,
              overflow: 'hidden',
            },
            shadowLg,
          ]}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8, alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: t.warnSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Icon.warn size={22} color={t.warn} />
            </View>
            <Text style={{ fontFamily: type.familyBold, fontSize: 16, color: t.ink, textAlign: 'center' }}>
              {tx('profile.account.discard.title')}
            </Text>
            <Text
              style={{
                fontFamily: type.family,
                fontSize: 13,
                color: t.inkSoft,
                marginTop: 6,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {tx('profile.account.discard.body')}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: t.border,
            }}
          >
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                borderRightWidth: 1,
                borderRightColor: t.border,
              }}
            >
              <Text style={{ color: t.ink, fontFamily: type.familySemi, fontSize: 15 }}>
                {tx('profile.account.discard.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: t.danger, fontFamily: type.familyBold, fontSize: 15 }}>
                {tx('profile.account.discard.confirm')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
