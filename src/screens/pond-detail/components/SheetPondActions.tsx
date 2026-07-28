import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { dangerInk, warnInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { SheetShell } from '@/components/sheet';
import { StatusBadge } from '@/components/domain/StatusPip';
import { displayPondName, fmt } from '@/utils/fmt';
import type { PondModel } from '@/features/pond';

type Props = {
  visible: boolean;
  pond: PondModel | null;
  /** Pond has recorded fill/move/sell history — blocks delete. */
  hasHistory: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
};

/**
 * The pond's "…" menu, replacing the coming-soon Alert.
 *
 * Two rules shape what's offered, both stricter than the API:
 *
 *  · **Status is only togglable on an empty pond.** `PUT /pond/:id` writes the
 *    status field and nothing else — it does not close an open cycle the way
 *    sell/move `markToClose` does. Offering it on a stocked pond would let a
 *    farmer "close" a pond whose cycle stays open, and the P&L would keep
 *    accruing behind a pond that looks finished. With fish in the water, the
 *    honest answer is "sell or move them out first".
 *  · **Delete needs an empty pond with no history.** The server happily deletes
 *    either way, leaving the pond's activities and daily logs pointing at a row
 *    that no longer appears anywhere.
 */
export function SheetPondActions({
  visible,
  pond,
  hasHistory,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  const { t, mode, shadow } = useTheme();
  const { t: tx } = useTranslation();
  const danger = dangerInk(mode, t);

  if (!pond) {
    return <SheetShell visible={visible} onClose={onClose} fitContent showClose />;
  }

  const hasFish = pond.totalFish > 0;
  const isClosed = pond.status === 'maintenance';
  const canToggle = !hasFish;
  const canDelete = !hasFish && !hasHistory;
  const blockedNote = hasFish
    ? tx('pondDetail.actions.hasFishNote')
    : hasHistory
      ? tx('pondDetail.actions.hasHistoryNote')
      : null;

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent showClose>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        {/* Identity */}
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
              {displayPondName(pond.name)}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}
            >
              {tx('flows.stockOnly', { count: fmt.num(pond.totalFish) })}
            </Text>
          </View>
          <StatusBadge s={pond.status} />
        </Row>

        {/* Primary — edit */}
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
              {tx('pondDetail.actions.edit')}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.sm,
                color: t.brandInk,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {tx('pondDetail.actions.editSub')}
            </Text>
          </View>
          <Icon.chevR size={18} color={t.brandInk} />
        </Tappable>

        {/* Status toggle — only meaningful on an empty pond (see the note above) */}
        {canToggle ? (
          <Tappable
            onPress={onToggleStatus}
            accessibilityRole="button"
            android_ripple={{ color: t.surfaceAlt }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[3],
              paddingHorizontal: space[2],
              paddingVertical: space[3],
              marginTop: space[2],
              borderRadius: radii.md,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: radii.sm,
                backgroundColor: t.warnSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.wrench size={18} color={warnInk(mode, t)} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: t.ink }}
              >
                {isClosed ? tx('pondDetail.actions.reopen') : tx('pondDetail.actions.close')}
              </Text>
              <Text
                style={{
                  fontSize: type.sizes.sm,
                  color: t.inkMute,
                  fontFamily: type.family,
                  marginTop: 2,
                }}
              >
                {isClosed ? tx('pondDetail.actions.reopenSub') : tx('pondDetail.actions.closeSub')}
              </Text>
            </View>
          </Tappable>
        ) : null}

        {/* Destructive — demoted, and absent unless it's actually safe */}
        {canDelete ? (
          <>
            <View style={{ height: 1, backgroundColor: t.border, marginVertical: space[2] }} />
            <Tappable
              onPress={onDelete}
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
                  backgroundColor: t.dangerSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.trash size={18} color={danger} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: danger }}
                >
                  {tx('pondDetail.actions.delete')}
                </Text>
                <Text
                  style={{
                    fontSize: type.sizes.sm,
                    color: t.inkMute,
                    fontFamily: type.family,
                    marginTop: 2,
                  }}
                >
                  {tx('pondDetail.actions.deleteSub')}
                </Text>
              </View>
            </Tappable>
          </>
        ) : null}

        {/* Say why the missing actions are missing — a menu that silently drops
            rows reads as a bug. */}
        {blockedNote ? (
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
              {blockedNote}
            </Text>
          </Row>
        ) : null}
      </View>
    </SheetShell>
  );
}
