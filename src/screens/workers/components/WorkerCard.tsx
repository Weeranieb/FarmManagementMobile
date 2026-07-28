import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Card, Pill, Tappable } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { UserLevel } from '@/features/auth';
import type { UserResponse } from '@/features/auth';

type Props = {
  worker: UserResponse;
  /** True for the signed-in admin's own row. */
  isSelf: boolean;
  onPress: () => void;
};

export function WorkerCard({ worker, isSelf, onPress }: Props) {
  const { t, shadow } = useTheme();
  const { t: tx } = useTranslation();

  const fullName = `${worker.firstName} ${worker.lastName ?? ''}`.trim();
  const initial = (worker.firstName?.[0] || worker.username?.[0] || '–').toUpperCase();
  const isOwner = worker.userLevel >= UserLevel.ClientAdmin;

  return (
    <Card padded={false} style={shadow}>
      <Tappable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={fullName || worker.username}
        android_ripple={{ color: t.surfaceAlt }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          padding: space[3] + 2,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isOwner ? t.brandSoft : t.surfaceAlt,
            borderWidth: 1.5,
            borderColor: isOwner ? t.brand : t.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: isOwner ? t.brandInk : t.inkSoft,
              fontFamily: type.familyBold,
              fontSize: 17,
            }}
          >
            {initial}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Row gap={space[2]} align="center">
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                fontSize: type.sizes.base,
                fontFamily: type.familySemi,
                color: t.ink,
              }}
            >
              {fullName || worker.username}
            </Text>
            {/* Marking your own row matters here: it is the one row whose role
                cannot be changed and which cannot be removed. */}
            {isSelf ? (
              <Text
                style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}
              >
                {tx('workers.you')}
              </Text>
            ) : null}
          </Row>
          <Text
            numberOfLines={1}
            style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.familyNum }}
          >
            {worker.username}
            {worker.contactNumber ? ` · ${worker.contactNumber}` : ''}
          </Text>
        </View>

        <Pill tone={isOwner ? 'brand' : 'neutral'}>
          {isOwner ? tx('workers.role.owner') : tx('workers.role.worker')}
        </Pill>
        <Icon.chevR size={16} color={t.inkSoft} />
      </Tappable>
    </Card>
  );
}

export const WORKER_CARD_RADIUS = radii.md;
