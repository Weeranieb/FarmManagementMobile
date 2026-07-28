import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';

type Props = {
  isAdmin: boolean;
  onAdd?: () => void;
};

/** Designed empty state — a real next action for admins, honest guidance for
 *  everyone else. No sad centered icon + "no data". */
export function MerchantEmptyState({ isAdmin, onAdd }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();

  return (
    <View style={{ paddingTop: 48, paddingHorizontal: 32, paddingBottom: 24, alignItems: 'center', gap: 14 }}>
      {/* Two overlapping soft tiles — reads as a composition, not one box */}
      <View style={{ width: 108, height: 96, marginBottom: 4 }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 6,
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-6deg' }],
          }}
        >
          <Icon.user size={28} color={t.inkMute} stroke={1.7} />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 18,
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: t.brandSoft,
            borderWidth: 1,
            borderColor: t.brand + '33',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '6deg' }],
            shadowColor: '#141c28',
            shadowOpacity: 0.1,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Icon.merchant size={30} color={t.brandInk} stroke={1.7} />
        </View>
      </View>

      <View style={{ alignItems: 'center', gap: 6, maxWidth: 290 }}>
        <Text style={{ fontSize: 18, fontFamily: type.familyBold, color: t.ink, lineHeight: 26, textAlign: 'center' }}>
          {tx('merchants.empty.title')}
        </Text>
        <Text
          style={{
            fontSize: 13.5,
            color: t.inkMute,
            fontFamily: type.family,
            lineHeight: 22,
            textAlign: 'center',
          }}
        >
          {isAdmin
            ? tx('merchants.empty.adminHelp')
            : tx('merchants.empty.workerHelp')}
        </Text>
      </View>

      {isAdmin ? (
        <Tappable
          onPress={onAdd}
          accessibilityRole="button"
          style={{
            marginTop: 6,
            height: 48,
            paddingHorizontal: 22,
            borderRadius: radii.md,
            backgroundColor: t.brand,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon.plus size={18} color="#fff" stroke={2.2} />
          <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
            {tx('merchants.addFirst')}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}
