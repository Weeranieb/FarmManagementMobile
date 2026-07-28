import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Pill, Tappable } from '@/components/ui';
import { dangerInk, warnInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import { UserLevel } from '@/features/auth';
import type { UserResponse } from '@/features/auth';

type Props = {
  visible: boolean;
  worker: UserResponse | null;
  /** The signed-in admin's own row. */
  isSelf: boolean;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onRemove: () => void;
};

function ActionRow({
  icon,
  tint,
  soft,
  label,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  tint: string;
  soft: string;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  const { t } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[2],
        paddingVertical: space[3],
        borderRadius: radii.md,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: radii.sm,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: tint }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.sm,
            color: t.inkMute,
            fontFamily: type.family,
            marginTop: 2,
          }}
        >
          {sub}
        </Text>
      </View>
    </Tappable>
  );
}

/**
 * A staff member's menu.
 *
 * "Remove" is absent on your own row rather than shown-and-failing: the server
 * refuses self-deletion, and an admin who deleted the only admin would lock the
 * whole client out of this screen.
 */
export function SheetWorkerActions({
  visible,
  worker,
  isSelf,
  onClose,
  onEdit,
  onResetPassword,
  onRemove,
}: Props) {
  const { t, mode, shadow } = useTheme();
  const { t: tx } = useTranslation();
  const danger = dangerInk(mode, t);

  if (!worker) {
    return <SheetShell visible={visible} onClose={onClose} fitContent showClose />;
  }

  const fullName = `${worker.firstName} ${worker.lastName ?? ''}`.trim();
  const isOwner = worker.userLevel >= UserLevel.ClientAdmin;

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent showClose>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} align="center" style={{ marginBottom: space[4] }}>
          <View style={{ flex: 1, minWidth: 0, gap: space[1] }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: type.sizes.lg,
                fontFamily: type.familyBold,
                color: t.ink,
                lineHeight: 24,
              }}
            >
              {fullName || worker.username}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.familyNum }}
            >
              {worker.username}
            </Text>
          </View>
          <Pill tone={isOwner ? 'brand' : 'neutral'}>
            {isOwner ? tx('workers.role.owner') : tx('workers.role.worker')}
          </Pill>
        </Row>

        <Tappable
          onPress={onEdit}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[3],
            padding: space[3],
            borderRadius: radii.md,
            backgroundColor: t.brandSoft,
            borderWidth: 1.5,
            borderColor: t.brand,
            ...shadow,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radii.sm,
              backgroundColor: t.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.edit size={22} color={t.brandInk} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: t.brandInk }}
            >
              {tx('workers.actions.edit')}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.sm,
                color: t.brandInk,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {tx('workers.actions.editSub')}
            </Text>
          </View>
          <Icon.chevR size={18} color={t.brandInk} />
        </Tappable>

        <View style={{ marginTop: space[2] }}>
          <ActionRow
            icon={<Icon.lock size={18} color={warnInk(mode, t)} />}
            tint={t.ink}
            soft={t.warnSoft}
            label={tx('workers.actions.resetPassword')}
            sub={tx('workers.actions.resetPasswordSub')}
            onPress={onResetPassword}
          />
        </View>

        {!isSelf ? (
          <>
            <View style={{ height: 1, backgroundColor: t.border, marginVertical: space[2] }} />
            <ActionRow
              icon={<Icon.trash size={18} color={danger} />}
              tint={danger}
              soft={t.dangerSoft}
              label={tx('workers.actions.remove')}
              sub={tx('workers.actions.removeSub')}
              onPress={onRemove}
            />
          </>
        ) : (
          <Row
            gap={6}
            align="center"
            style={{
              marginTop: space[3],
              padding: space[3],
              borderRadius: radii.md,
              backgroundColor: t.surfaceAlt,
            }}
          >
            <Icon.info size={14} color={t.inkSoft} />
            <Text
              style={{
                flex: 1,
                fontSize: 11.5,
                lineHeight: 17,
                color: t.inkSoft,
                fontFamily: type.family,
              }}
            >
              {tx('workers.actions.selfNote')}
            </Text>
          </Row>
        )}
      </View>
    </SheetShell>
  );
}
