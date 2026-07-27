// Inline farm + pond pickers — embedded at the TOP of Fill/Sell/Move forms
// when the user enters via the home-screen FAB (no pond context yet).
// When the user arrives from a pond-detail page, Fill/Sell already know the
// pond and skip these pickers entirely. Move still needs a destination, so it
// keeps the picker with the source pinned as an already-completed step
// (`lockedFrom`) — same stepped process the FAB entry gets, one step shorter.
//
// Controlled components — the form owns selection state so it can validate
// the CTA + persist state across review→back navigation.
//
// Design (boonma-taste-mobile): the farm is usually a foregone default, so it
// is demoted to a compact chip row; the pond — the real decision — gets the
// hero list. Ponds are grouped active-first with closed ("ปิดบ่อ") ponds under
// a labelled divider, so the loud status no longer interleaves with live ponds.
// Selection is a single bold, outdoor-safe cue (tone border + soft fill + a
// solid check), not a stack of four faint signals.

import { useCallback, useRef, type RefObject } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type, type ThemePalette } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Pill, Tappable } from '@/components/ui';
import { Col, Row } from '@/components/layout/Row';
import { displayFarmName, displayPondName, fmt } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';
import i18n from '@/locale/i18n';

type PickerTone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<PickerTone | 'brand', {
  solid: keyof ThemePalette;
  soft: keyof ThemePalette;
  ink: keyof ThemePalette;
}> = {
  fill: { solid: 'fill', soft: 'fillSoft', ink: 'fillInk' },
  sell: { solid: 'sell', soft: 'sellSoft', ink: 'sellInk' },
  move: { solid: 'move', soft: 'moveSoft', ink: 'moveInk' },
  brand: { solid: 'brand', soft: 'brandSoft', ink: 'brandInk' },
};

function toneColors(t: ThemePalette, tone: PickerTone | 'brand') {
  const k = TONE_KEYS[tone];
  return { solid: t[k.solid], soft: t[k.soft], ink: t[k.ink] };
}

// ─── Numbered step label that doubles as a progress affordance ──────────
function StepLabel({
  num,
  label,
  isCurrent,
  isComplete,
  tone,
}: {
  num: number;
  label: string;
  isCurrent: boolean;
  isComplete: boolean;
  tone: PickerTone;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  const bg = isComplete ? c.solid : isCurrent ? c.soft : t.surface;
  const fg = isComplete ? '#ffffff' : isCurrent ? c.ink : t.inkMute;
  return (
    <Row gap={space[2]} style={{ marginBottom: space[2] }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: isCurrent && !isComplete ? 1.5 : 0,
          borderColor: isCurrent && !isComplete ? c.solid : 'transparent',
        }}
      >
        {isComplete ? (
          <Icon.check size={12} color={fg} stroke={2.6} />
        ) : (
          <Text style={{ fontSize: type.sizes.xs, fontFamily: type.familyNumBold, color: fg }}>
            {num}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familyBold, color: t.ink }}>
        {label}
      </Text>
    </Row>
  );
}

// ─── Sub-group divider inside a pond list (e.g. the closed-ponds group) ──
function GroupDivider({ label }: { label: string }) {
  const { t } = useTheme();
  return (
    <Row gap={space[2]} style={{ marginTop: space[1], marginBottom: 2 }}>
      <Text style={{ fontSize: type.sizes.xs, fontFamily: type.familySemi, color: t.inkMute }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
    </Row>
  );
}

// ─── Selection indicator: an empty ring when off, a solid check when on ──
// One bold cue that survives `outdoor` where soft background tints wash out.
function SelectDot({ selected, tone }: { selected: boolean; tone: PickerTone }) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  if (selected) {
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: c.solid,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.check size={13} color="#ffffff" stroke={2.8} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: t.borderStrong,
        backgroundColor: 'transparent',
      }}
    />
  );
}

// ─── Compact farm chip — farms are demoted from full cards to a chip row ─
function FarmChip({
  selected,
  disabled,
  tone,
  label,
  meta,
  onPress,
}: {
  selected: boolean;
  disabled?: boolean;
  tone: PickerTone;
  label: string;
  meta?: string;
  onPress: () => void;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <Tappable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[2] - 2,
          minHeight: 44,
          paddingVertical: space[2],
          paddingHorizontal: space[3],
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: selected ? c.solid : t.border,
          backgroundColor: selected ? c.solid : t.surface,
        }}
      >
        <Icon.farm size={15} color={selected ? '#ffffff' : t.inkSoft} stroke={selected ? 2 : 1.7} />
        <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familySemi, color: selected ? '#ffffff' : t.ink }}>
          {label}
        </Text>
        {meta ? (
          <Text
            style={{
              fontSize: type.sizes.xs,
              fontFamily: type.familyNum,
              color: selected ? 'rgba(255,255,255,0.82)' : t.inkMute,
            }}
          >
            {meta}
          </Text>
        ) : null}
      </View>
    </Tappable>
  );
}

// ─── Pond glyph — status-aware (active = fish, closed = cycle/warn) ──────
function PondGlyph({
  pond,
  tone,
  selected,
}: {
  pond: PondModel;
  tone: PickerTone;
  selected: boolean;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  const isMaint = pond.status === 'maintenance';
  const bg = selected ? c.solid : isMaint ? t.warnSoft : t.surfaceAlt;
  const fg = selected ? '#ffffff' : isMaint ? t.warn : t.inkSoft;
  const G = isMaint ? Icon.cycle : Icon.fish;
  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: radii.sm,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <G size={18} color={fg} stroke={selected ? 2 : 1.7} />
    </View>
  );
}

// ─── Hero pond row — the primary decision of the picker ─────────────────
function PondRow({
  pond,
  selected,
  disabled,
  tone,
  primary,
  secondary,
  badge,
  onPress,
}: {
  pond: PondModel;
  selected: boolean;
  disabled?: boolean;
  tone: PickerTone;
  primary: string;
  secondary?: string;
  badge?: React.ReactNode;
  /** Omit for a row that is already decided and can't be re-picked. */
  onPress?: () => void;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <Tappable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      // No onPress = an already-decided row: drop the press cue and the button
      // role so it doesn't advertise a tap that does nothing.
      feedback={onPress ? 'opacity' : 'none'}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected, disabled: !!disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingVertical: space[3],
          paddingHorizontal: space[3],
          borderRadius: radii.md,
          borderWidth: selected ? 2 : 1.5,
          borderColor: selected ? c.solid : t.border,
          backgroundColor: selected ? c.soft : t.surface,
        }}
      >
        <PondGlyph pond={pond} tone={tone} selected={selected} />
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={space[2] - 2}>
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                fontFamily: type.familyBold,
                fontSize: type.sizes.md,
                color: selected ? c.ink : t.ink,
              }}
            >
              {primary}
            </Text>
            {badge}
          </Row>
          {secondary ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.familyNum }}
            >
              {secondary}
            </Text>
          ) : null}
        </Col>
        <SelectDot selected={selected} tone={tone} />
      </View>
    </Tappable>
  );
}

// ─── Disabled / empty states ────────────────────────────────────────────
function DisabledSlot({ msg }: { msg: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingVertical: space[4] + 2,
        paddingHorizontal: space[3],
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: t.border,
        borderStyle: 'dashed',
        backgroundColor: t.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[2],
      }}
    >
      <Icon.warn size={14} color={t.inkMute} />
      <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.familyMedium }}>
        {msg}
      </Text>
    </View>
  );
}

function EmptyInline({
  icon,
  title,
  body,
}: {
  icon: 'farm' | 'fish';
  title: string;
  body: string;
}) {
  const { t } = useTheme();
  const I = icon === 'farm' ? Icon.farm : Icon.fish;
  return (
    <View
      style={{
        paddingVertical: space[4] + 2,
        paddingHorizontal: space[3],
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.borderStrong,
        borderStyle: 'dashed',
        alignItems: 'center',
        gap: space[2],
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <I size={20} color={t.inkMute} stroke={1.5} />
      </View>
      <Text
        style={{
          fontSize: type.sizes.base,
          fontFamily: type.familyBold,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          maxWidth: 280,
          lineHeight: 20,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

// ─── Outer panel — a slightly sunk surface so the raised rows read above it
function PickerCard({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        padding: space[3],
        borderRadius: radii.lg,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1,
        borderColor: t.border,
        marginBottom: space[3],
      }}
    >
      {children}
    </View>
  );
}

function pondMeta(pond: PondModel): string {
  return pond.ageDays != null
    ? i18n.t('flows.stockWithAge', { count: fmt.num(pond.totalFish), days: pond.ageDays })
    : i18n.t('flows.stockOnly', { count: fmt.num(pond.totalFish) });
}

function sellPondMeta(pond: PondModel): string {
  if (pond.totalFish === 0) return i18n.t('flows.noFish');
  return pondMeta(pond);
}

// ════════════════════════════════════════════════════════════════════════
// FILL / SELL — farm chips → pond list
// ════════════════════════════════════════════════════════════════════════

type FarmPondPickerProps = {
  action: 'fill' | 'sell';
  farms: FarmModel[];
  ponds: PondModel[];
  defaultFarmId: number | null;
  farmId: number | null;
  pondId: number | null;
  onFarmChange: (id: number) => void;
  onPondChange: (id: number) => void;
  /** Anchor placed at the start of the pond section so the host can scroll to it. */
  pondSectionRef?: RefObject<View | null>;
};

/** i18next keys for the pond-section heading, resolved in the component. */
const ACTION_LABEL_KEY = {
  fill: 'flows.move.pickDest',
  sell: 'flows.sell.pickPond',
} as const;

const ACTION_TONE: Record<'fill' | 'sell', PickerTone> = {
  fill: 'fill',
  sell: 'sell',
};

function canPickForAction(action: 'fill' | 'sell', pond: PondModel) {
  if (action === 'sell') return pond.status === 'active' && pond.totalFish > 0;
  return true;
}

// A farm is a dead-end for the action: fill needs at least one pond to exist;
// sell needs at least one active pond. Dead-ends are dimmed + sorted last.
function farmDeadEnd(action: 'fill' | 'sell', f: FarmModel) {
  return action === 'sell' ? f.activePonds === 0 : f.pondCount === 0;
}

// Sort pickable farms first, and float the default to the front within them —
// so the chip the user almost always wants sits leftmost and preselected.
function sortFarms<T extends FarmModel>(
  farms: T[],
  defaultFarmId: number | null,
  deadEnd: (f: T) => boolean,
): T[] {
  return [...farms].sort((a, b) => {
    const da = deadEnd(a) ? 1 : 0;
    const db = deadEnd(b) ? 1 : 0;
    if (da !== db) return da - db;
    const fa = a.id === defaultFarmId ? 0 : 1;
    const fb = b.id === defaultFarmId ? 0 : 1;
    return fa - fb;
  });
}

export function InlineFarmPondPicker({
  action,
  farms,
  ponds,
  defaultFarmId,
  farmId,
  pondId,
  onFarmChange,
  onPondChange,
  pondSectionRef,
}: FarmPondPickerProps) {
  const { t: tx } = useTranslation();
  const tone = ACTION_TONE[action];
  const pondsForFarm = farmId != null ? ponds.filter((p) => p.farmId === farmId) : [];
  // Sell hides non-sellable ponds (closed or empty). Fill lists everything —
  // filling a closed pond is the legitimate "start new cycle" path — but splits
  // closed ponds into their own group instead of interleaving them.
  const visiblePonds =
    action === 'sell' ? pondsForFarm.filter((p) => canPickForAction(action, p)) : pondsForFarm;
  const activePonds = visiblePonds.filter((p) => p.status !== 'maintenance');
  const closedPonds =
    action === 'fill' ? visiblePonds.filter((p) => p.status === 'maintenance') : [];

  const deadEnd = (f: FarmModel) => farmDeadEnd(action, f);
  const orderedFarms = sortFarms(farms, defaultFarmId, deadEnd);

  return (
    <PickerCard>
      <StepLabel
        num={1}
        label={tx('flows.pickFarm')}
        isCurrent={farmId == null}
        isComplete={farmId != null}
        tone={tone}
      />
      {farms.length === 0 ? (
        <EmptyInline
          icon="farm"
          title={tx('flows.noFarms')}
          body={tx('flows.noFarmAccess')}
        />
      ) : (
        <Row wrap gap={space[2]}>
          {orderedFarms.map((f) => (
            <FarmChip
              key={f.id}
              tone={tone}
              selected={farmId === f.id}
              disabled={deadEnd(f)}
              label={displayFarmName(f.name)}
              meta={tx('daily.pondCount', {
                count: action === 'sell' ? f.activePonds : f.pondCount,
              })}
              onPress={() => onFarmChange(f.id)}
            />
          ))}
        </Row>
      )}

      <View style={{ height: space[3] }} />
      <View ref={pondSectionRef} />

      <StepLabel
        num={2}
        label={tx(ACTION_LABEL_KEY[action])}
        isCurrent={farmId != null && pondId == null}
        isComplete={pondId != null}
        tone={tone}
      />
      {farmId == null ? (
        <DisabledSlot msg={tx('flows.pickFarmToSeePonds')} />
      ) : pondsForFarm.length === 0 ? (
        <EmptyInline
          icon="fish"
          title={tx('flows.farmNoPonds')}
          body={tx('flows.addPondsFirst')}
        />
      ) : visiblePonds.length === 0 ? (
        <EmptyInline
          icon="fish"
          title={tx('flows.sell.noSellablePonds')}
          body={tx('flows.allPondsClosed')}
        />
      ) : (
        <Col gap={space[2]}>
          {activePonds.map((p) => (
            <PondRow
              key={p.id}
              tone={tone}
              pond={p}
              selected={pondId === p.id}
              primary={displayPondName(p.name)}
              secondary={action === 'sell' ? sellPondMeta(p) : pondMeta(p)}
              onPress={() => onPondChange(p.id)}
            />
          ))}
          {closedPonds.length > 0 ? (
            <>
              <GroupDivider label={tx('flows.closedPondFill')} />
              {closedPonds.map((p) => (
                <PondRow
                  key={p.id}
                  tone={tone}
                  pond={p}
                  selected={pondId === p.id}
                  primary={displayPondName(p.name)}
                  secondary={tx('flows.readyNewCycle')}
                  onPress={() => onPondChange(p.id)}
                />
              ))}
            </>
          ) : null}
        </Col>
      )}
    </PickerCard>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MOVE — farm chips → source pond → destination pond
// ════════════════════════════════════════════════════════════════════════

type MovePickerProps = {
  farms: FarmModel[];
  ponds: PondModel[];
  defaultFarmId: number | null;
  farmId: number | null;
  fromId: number | null;
  toId: number | null;
  onFarmChange: (id: number) => void;
  onFromChange: (id: number) => void;
  onToChange: (id: number) => void;
  allowCrossFarm?: boolean;
  /**
   * Pond-detail entry: the source is already decided, so the farm + source
   * steps collapse into one fixed row and the destination becomes step 2.
   * The picker still runs as a visible process instead of vanishing.
   */
  lockedFrom?: PondModel | null;
  /** Anchor placed at the start of the source-pond section. */
  sourceSectionRef?: RefObject<View | null>;
  /** Anchor placed at the start of the destination-pond section. */
  destSectionRef?: RefObject<View | null>;
};

export function InlineMovePicker({
  farms,
  ponds,
  defaultFarmId,
  farmId,
  fromId,
  toId,
  onFarmChange,
  onFromChange,
  onToChange,
  allowCrossFarm = false,
  lockedFrom,
  sourceSectionRef,
  destSectionRef,
}: MovePickerProps) {
  const tone: PickerTone = 'move';
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const c = toneColors(t, tone);
  const locked = lockedFrom != null;
  // With a locked source there is no farm step, so the destination is step 2.
  const destStepNum = locked ? 2 : 3;

  const sourcePonds =
    farmId != null
      ? ponds.filter(
          (p) =>
            (allowCrossFarm || p.farmId === farmId) &&
            p.status === 'active' &&
            p.totalFish > 0,
        )
      : [];
  const destPonds =
    farmId != null && fromId != null
      ? ponds.filter((p) => (allowCrossFarm || p.farmId === farmId) && p.id !== fromId)
      : [];
  const destActive = destPonds.filter((p) => p.status !== 'maintenance');
  const destClosed = destPonds.filter((p) => p.status === 'maintenance');

  const orderedFarms = sortFarms(farms, defaultFarmId, (f) => f.activePonds === 0);

  const crossFarmBadge = (p: PondModel) =>
    allowCrossFarm && farmId != null && p.farmId !== farmId ? (
      <Pill tone="neutral">{displayFarmName(p.farmName)}</Pill>
    ) : null;

  return (
    <PickerCard>
      {allowCrossFarm ? (
        <View
          style={{
            marginBottom: space[3],
            paddingVertical: space[2],
            paddingHorizontal: space[3] - 2,
            borderRadius: radii.sm,
            backgroundColor: c.soft,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[2] - 2,
          }}
        >
          <Icon.swap size={12} color={c.ink} />
          <Text style={{ fontSize: type.sizes.xs, fontFamily: type.familyMedium, color: c.ink }}>
            {tx('flows.crossFarmMode')}
          </Text>
        </View>
      ) : null}

      {locked ? (
        <>
          <StepLabel
            num={1}
            label={tx('flows.move.fromLabel')}
            isCurrent={false}
            isComplete
            tone={tone}
          />
          {/* No onPress — the source came from the pond the user opened this
              from, so the row states it rather than offering a choice. The
              neutral badge stays legible on the selected row's tone fill. */}
          <PondRow
            tone={tone}
            pond={lockedFrom}
            selected
            primary={displayPondName(lockedFrom.name)}
            secondary={pondMeta(lockedFrom)}
            badge={<Pill tone="neutral">{tx('flows.move.source')}</Pill>}
          />
        </>
      ) : (
        <>
          <StepLabel
            num={1}
            label={allowCrossFarm ? tx('flows.refFarm') : tx('flows.pickFarm')}
            isCurrent={farmId == null}
            isComplete={farmId != null}
            tone={tone}
          />
          {farms.length === 0 ? (
            <EmptyInline
              icon="farm"
              title={tx('flows.noFarms')}
              body={tx('flows.contactAdmin')}
            />
          ) : (
            <Row wrap gap={space[2]}>
              {orderedFarms.map((f) => (
                <FarmChip
                  key={f.id}
                  tone={tone}
                  selected={farmId === f.id}
                  label={displayFarmName(f.name)}
                  meta={tx('daily.pondCount', { count: f.activePonds })}
                  onPress={() => onFarmChange(f.id)}
                />
              ))}
            </Row>
          )}

          <View style={{ height: space[3] }} />
          <View ref={sourceSectionRef} />

          <StepLabel
            num={2}
            label={tx('flows.move.fromLabel')}
            isCurrent={farmId != null && fromId == null}
            isComplete={fromId != null}
            tone={tone}
          />
          {farmId == null ? (
            <DisabledSlot msg={tx('flows.pickFarmFirst')} />
          ) : sourcePonds.length === 0 ? (
            <EmptyInline
              icon="fish"
              title={tx('flows.move.noSource')}
              body={tx('flows.farmNoStockedPonds')}
            />
          ) : (
            <Col gap={space[2]}>
              {sourcePonds.map((p) => (
                <PondRow
                  key={p.id}
                  tone={tone}
                  pond={p}
                  selected={fromId === p.id}
                  primary={displayPondName(p.name)}
                  secondary={pondMeta(p)}
                  badge={crossFarmBadge(p)}
                  onPress={() => onFromChange(p.id)}
                />
              ))}
            </Col>
          )}
        </>
      )}

      <View style={{ height: space[3] }} />
      <View ref={destSectionRef} />

      <StepLabel
        num={destStepNum}
        label={tx('flows.move.toLabel')}
        isCurrent={fromId != null && toId == null}
        isComplete={toId != null && fromId !== toId}
        tone={tone}
      />
      {fromId == null ? (
        <DisabledSlot msg={tx('flows.move.pickSourceFirst')} />
      ) : destPonds.length === 0 ? (
        <EmptyInline
          icon="fish"
          title={tx('flows.move.noDest')}
          body={tx('flows.move.needOtherPond')}
        />
      ) : (
        <Col gap={space[2]}>
          {destActive.map((p) => (
            <PondRow
              key={p.id}
              tone={tone}
              pond={p}
              selected={toId === p.id}
              primary={displayPondName(p.name)}
              secondary={pondMeta(p)}
              badge={crossFarmBadge(p)}
              onPress={() => onToChange(p.id)}
            />
          ))}
          {destClosed.length > 0 ? (
            <>
              <GroupDivider label={tx('flows.closedPondMove')} />
              {destClosed.map((p) => (
                <PondRow
                  key={p.id}
                  tone={tone}
                  pond={p}
                  selected={toId === p.id}
                  primary={displayPondName(p.name)}
                  secondary={tx('flows.readyNewCycle')}
                  badge={crossFarmBadge(p)}
                  onPress={() => onToChange(p.id)}
                />
              ))}
            </>
          ) : null}
        </Col>
      )}
    </PickerCard>
  );
}

// ─── Validation banner shown above the disabled CTA ─────────────────────
export function PickerValidationBanner({ msg }: { msg: string | null }) {
  const { t } = useTheme();
  if (!msg) return null;
  return (
    <View
      style={{
        paddingVertical: space[2],
        paddingHorizontal: space[3],
        borderRadius: radii.sm,
        backgroundColor: t.warnSoft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[2],
      }}
    >
      <Icon.warn size={14} color={t.statusMaint} />
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.statusMaint,
          fontFamily: type.familyMedium,
          flexShrink: 1,
        }}
      >
        {msg}
      </Text>
    </View>
  );
}

// ─── Auto-advance helper: scroll the host ScrollView to a child anchor ──
// Returns a ScrollView ref + a `scrollTo` callback that the form wraps around
// its onPick handlers so each pick advances the user to the next section.
//
// New Architecture (Fabric) note: `findNodeHandle(scrollRef.current)` returns
// the composite handle which `measureLayout` rejects. We pass the native
// ScrollView ref obtained via `getNativeScrollRef()` instead — that's the
// recommended approach for RN 0.66+ on Fabric.
export function useAutoAdvance() {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToAnchor = useCallback(
    (anchor: RefObject<View | null>, offset = 16) => {
      const sv = scrollRef.current;
      const v = anchor.current;
      if (!sv || !v) return;

      const nativeScrollRef = sv.getNativeScrollRef?.();
      if (!nativeScrollRef) return;

      // Defer one tick so React has flushed layout for the picker re-render
      // (the selection cue fills + completed-state appears before we measure).
      setTimeout(() => {
        try {
          v.measureLayout(
            nativeScrollRef,
            (_x, y) => sv.scrollTo({ y: Math.max(0, y - offset), animated: true }),
            () => {
              /* measureLayout failed — anchor unmounted between schedule + tick. */
            },
          );
        } catch {
          /* anchor unmounted or ScrollView native ref invalidated. */
        }
      }, 80);
    },
    [],
  );

  return { scrollRef, scrollToAnchor };
}

// ─── Helper for screens to dim a region until selection is complete ──────
export function DimWrap({
  ready,
  hint,
  children,
}: {
  ready: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ opacity: ready ? 1 : 0.45 }} pointerEvents={ready ? 'auto' : 'none'}>
      {!ready && hint ? (
        <Text
          style={{
            marginBottom: space[3],
            fontSize: type.sizes.sm,
            color: t.inkMute,
            fontFamily: type.familyMedium,
          }}
        >
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
