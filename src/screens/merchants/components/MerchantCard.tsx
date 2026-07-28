import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Card, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import type { MerchantModel } from '@/features/merchant';

type Props = {
  merchant: MerchantModel;
  isAdmin: boolean;
  onMore?: () => void;
};

/** Compact two-line merchant row — matches the คลังอาหาร FeedCard rhythm so the
 *  two manage tools read as one family. Line 1: avatar · name. Line 2: location
 *  · contact (or a muted "no contact yet"). Kebab opens the actions sheet. */
export function MerchantCard({ merchant, isAdmin, onMore }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const initial = merchant.name.trim().slice(0, 1) || '?';
  const hasContact = Boolean(merchant.contactNumber);
  const hasLocation = Boolean(merchant.location);

  return (
    <Card padded={false}>
      <Row gap={11} align="center" style={{ paddingVertical: 10, paddingHorizontal: 11 }}>
        {/* Avatar tile */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: t.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: t.brandInk }}>
            {initial}
          </Text>
        </View>

        {/* Two-line main block */}
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: type.sizes.base,
              fontFamily: type.familySemi,
              color: t.ink,
              lineHeight: 20,
            }}
          >
            {merchant.name}
          </Text>

          {hasContact || hasLocation ? (
            <Row gap={space[2]} align="center" style={{ minWidth: 0 }}>
              {hasContact ? (
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 12.5, color: t.ink, fontFamily: type.familyNumMedium, flexShrink: 0 }}
                >
                  {merchant.contactNumber}
                </Text>
              ) : null}
              {hasContact && hasLocation ? (
                <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>·</Text>
              ) : null}
              {hasLocation ? (
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 12.5, color: t.inkMute, fontFamily: type.family, flexShrink: 1 }}
                >
                  {merchant.location}
                </Text>
              ) : null}
            </Row>
          ) : (
            <Text style={{ fontSize: 12.5, color: t.inkMute, fontFamily: type.family }}>
              {tx('merchants.noContact')}
            </Text>
          )}
        </View>

        {/* Kebab */}
        {isAdmin ? (
          <Tappable
            onPress={onMore}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={tx('merchants.options')}
            style={{
              width: 28,
              height: 44,
              borderRadius: radii.sm,
              marginRight: -4,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.more size={19} color={t.inkSoft} />
          </Tappable>
        ) : null}
      </Row>
    </Card>
  );
}
