// Inline farm + pond pickers — embedded at the TOP of Fill/Sell/Move forms
// when the user enters via the home-screen FAB (no pond context yet).
// When the user arrives from a pond-detail page, the form already knows the
// pond and skips these pickers entirely.
//
// Controlled components — the form owns selection state so it can validate
// the CTA + persist state across review→back navigation.

import { useCallback, useRef, type RefObject } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type, type ThemePalette } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/ui';
import { Col, Row } from '@/components/layout/Row';
import { displayFarmName, displayPondName, fmt } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';

type PickerTone = 'fill' | 'sell' | 'move';

const TONE_TO_PILL = {
  fill: 'fill',
  sell: 'sell',
  move: 'move',
  brand: 'brand',
} as const;

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
  const bg = isComplete ? c.solid : isCurrent ? c.soft : t.surfaceAlt;
  const fg = isComplete ? '#ffffff' : isCurrent ? c.ink : t.inkMute;
  return (
    <Row gap={10} style={{ marginBottom: 8 }}>
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
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyNumBold,
              color: fg,
            }}
          >
            {num}
          </Text>
        )}
      </View>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.familyBold,
          color: t.ink,
        }}
      >
        {label}
      </Text>
    </Row>
  );
}

// ─── Single-row selectable list card ────────────────────────────────────
function PickCard({
  selected,
  disabled,
  onPress,
  tone,
  leading,
  primary,
  secondary,
  badge,
}: {
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  tone: PickerTone;
  leading: React.ReactNode;
  primary: string;
  secondary?: string;
  badge?: React.ReactNode;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          width: '100%',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: selected ? c.solid : t.border,
          backgroundColor: selected ? c.soft : disabled ? t.surfaceAlt : t.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {leading}
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={6}>
            <Text
              style={{
                fontFamily: type.familyBold,
                fontSize: 14,
                color: selected ? c.ink : t.ink,
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {primary}
            </Text>
            {badge}
          </Row>
          {secondary ? (
            <Text
              style={{
                fontSize: 12,
                color: t.inkMute,
                fontFamily: type.familyNum,
              }}
              numberOfLines={1}
            >
              {secondary}
            </Text>
          ) : null}
        </Col>
        <RadioDot selected={selected} tone={tone} disabled={disabled} />
      </View>
    </Pressable>
  );
}

function RadioDot({
  selected,
  tone,
  disabled,
}: {
  selected: boolean;
  tone: PickerTone;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: selected ? c.solid : disabled ? t.border : t.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      {selected ? (
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: c.solid,
          }}
        />
      ) : null}
    </View>
  );
}

// ─── Disabled / empty states ────────────────────────────────────────────
function DisabledSlot({ msg }: { msg: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 18,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: t.border,
        borderStyle: 'dashed',
        backgroundColor: t.surfaceAlt,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Icon.warn size={14} color={t.inkMute} />
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.familyMedium }}>{msg}</Text>
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
        paddingVertical: 18,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1,
        borderColor: t.borderStrong,
        borderStyle: 'dashed',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <I size={20} color={t.inkMute} stroke={1.5} />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontFamily: type.familyBold,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: t.inkMute,
          maxWidth: 280,
          lineHeight: 18,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

function FarmGlyph({ tone, selected }: { tone: PickerTone; selected: boolean }) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: selected ? c.solid : t.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon.farm size={18} color={selected ? '#ffffff' : t.brandInk} stroke={selected ? 2 : 1.6} />
    </View>
  );
}

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
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: selected ? c.solid : t.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isMaint ? (
        <Icon.cycle size={16} color={selected ? '#ffffff' : t.inkSoft} stroke={selected ? 2 : 1.6} />
      ) : (
        <Icon.fish size={18} color={selected ? '#ffffff' : t.inkSoft} stroke={selected ? 2 : 1.6} />
      )}
    </View>
  );
}

function PickerCard({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 16,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        marginBottom: 14,
      }}
    >
      {children}
    </View>
  );
}

function DefaultBadge() {
  return <Pill tone={TONE_TO_PILL.brand}>ค่าเริ่มต้น</Pill>;
}

function pondHint(pond: PondModel, action: 'fill' | 'sell'): string {
  if (pond.status === 'maintenance') {
    return action === 'sell' ? 'ปิดบ่อ · ไม่มีปลาให้ขาย' : 'ปิดบ่อ · จะเริ่มรอบใหม่';
  }
  if (action === 'sell' && pond.totalFish === 0) return 'ไม่มีปลา';
  const age = pond.ageDays != null ? ` · อายุ ${pond.ageDays} วัน` : '';
  return `${fmt.num(pond.totalFish)} ตัว${age}`;
}

// ════════════════════════════════════════════════════════════════════════
// FILL / SELL — farm picker → pond picker
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

const ACTION_LABEL = {
  fill: 'เลือกบ่อปลายทาง',
  sell: 'เลือกบ่อที่จะขาย',
} as const;

const ACTION_TONE: Record<'fill' | 'sell', PickerTone> = {
  fill: 'fill',
  sell: 'sell',
};

function canPickForAction(action: 'fill' | 'sell', pond: PondModel) {
  if (action === 'sell') return pond.status === 'active' && pond.totalFish > 0;
  return true;
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
  const tone = ACTION_TONE[action];
  const pondsForFarm = farmId != null ? ponds.filter((p) => p.farmId === farmId) : [];
  // Sell hides non-sellable ponds (closed or empty) — same behavior as the
  // move-source picker. Fill still lists everything because filling a closed
  // pond is a legitimate "start new cycle" path. canPickForAction is the
  // single source of truth for what counts as sellable.
  const visiblePonds =
    action === 'sell' ? pondsForFarm.filter((p) => canPickForAction(action, p)) : pondsForFarm;

  return (
    <PickerCard>
      <StepLabel
        num={1}
        label="เลือกฟาร์ม"
        isCurrent={farmId == null}
        isComplete={farmId != null}
        tone={tone}
      />
      {farms.length === 0 ? (
        <EmptyInline
          icon="farm"
          title="ยังไม่มีฟาร์ม"
          body="คุณยังไม่ได้รับสิทธิ์เข้าฟาร์มใด ๆ — ติดต่อผู้ดูแลระบบ"
        />
      ) : (
        <Col gap={6}>
          {farms.map((f) => (
            <PickCard
              key={f.id}
              tone={tone}
              selected={farmId === f.id}
              onPress={() => onFarmChange(f.id)}
              leading={<FarmGlyph tone={tone} selected={farmId === f.id} />}
              primary={displayFarmName(f.name)}
              secondary={`${f.activePonds} บ่อ ใช้งาน · ${f.pondCount} บ่อรวม`}
              badge={f.id === defaultFarmId ? <DefaultBadge /> : null}
            />
          ))}
        </Col>
      )}

      <View style={{ height: 12 }} />
      <View ref={pondSectionRef} />

      <StepLabel
        num={2}
        label={ACTION_LABEL[action]}
        isCurrent={farmId != null && pondId == null}
        isComplete={pondId != null}
        tone={tone}
      />
      {farmId == null ? (
        <DisabledSlot msg="เลือกฟาร์มก่อนเพื่อดูรายการบ่อ" />
      ) : pondsForFarm.length === 0 ? (
        <EmptyInline icon="fish" title="ฟาร์มนี้ยังไม่มีบ่อ" body="เพิ่มบ่อแรกของฟาร์มจากเว็บแอปก่อน" />
      ) : visiblePonds.length === 0 ? (
        <EmptyInline
          icon="fish"
          title="ไม่มีบ่อที่ขายได้"
          body="ทุกบ่อในฟาร์มนี้ปิดอยู่หรือไม่มีปลา"
        />
      ) : (
        <Col gap={6}>
          {visiblePonds.map((p) => (
            <PickCard
              key={p.id}
              tone={tone}
              selected={pondId === p.id}
              disabled={!canPickForAction(action, p)}
              onPress={() => onPondChange(p.id)}
              leading={<PondGlyph pond={p} tone={tone} selected={pondId === p.id} />}
              primary={displayPondName(p.name)}
              secondary={pondHint(p, action)}
              badge={p.status === 'maintenance' ? <Pill tone="warn">ปิดบ่อ</Pill> : null}
            />
          ))}
        </Col>
      )}
    </PickerCard>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MOVE — farm picker → source pond → destination pond
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
  sourceSectionRef,
  destSectionRef,
}: MovePickerProps) {
  const tone: PickerTone = 'move';
  const { t } = useTheme();
  const c = toneColors(t, tone);

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

  return (
    <PickerCard>
      {allowCrossFarm ? (
        <View
          style={{
            marginBottom: 12,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 8,
            backgroundColor: c.soft,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon.swap size={12} color={c.ink} />
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyMedium,
              color: c.ink,
            }}
          >
            โหมดข้ามฟาร์ม
          </Text>
        </View>
      ) : null}

      <StepLabel
        num={1}
        label={allowCrossFarm ? 'ฟาร์มอ้างอิง' : 'เลือกฟาร์ม'}
        isCurrent={farmId == null}
        isComplete={farmId != null}
        tone={tone}
      />
      {farms.length === 0 ? (
        <EmptyInline icon="farm" title="ยังไม่มีฟาร์ม" body="ติดต่อผู้ดูแลระบบเพื่อขอเข้าถึง" />
      ) : (
        <Col gap={6}>
          {farms.map((f) => (
            <PickCard
              key={f.id}
              tone={tone}
              selected={farmId === f.id}
              onPress={() => onFarmChange(f.id)}
              leading={<FarmGlyph tone={tone} selected={farmId === f.id} />}
              primary={displayFarmName(f.name)}
              secondary={`${f.activePonds} บ่อ ใช้งาน · ${f.pondCount} บ่อรวม`}
              badge={f.id === defaultFarmId ? <DefaultBadge /> : null}
            />
          ))}
        </Col>
      )}

      <View style={{ height: 12 }} />
      <View ref={sourceSectionRef} />

      <StepLabel
        num={2}
        label="จากบ่อ (ต้นทาง)"
        isCurrent={farmId != null && fromId == null}
        isComplete={fromId != null}
        tone={tone}
      />
      {farmId == null ? (
        <DisabledSlot msg="เลือกฟาร์มก่อน" />
      ) : sourcePonds.length === 0 ? (
        <EmptyInline
          icon="fish"
          title="ไม่มีบ่อที่มีปลาให้ย้าย"
          body="ฟาร์มนี้ยังไม่มีบ่อที่มีปลาอยู่"
        />
      ) : (
        <Col gap={6}>
          {sourcePonds.map((p) => (
            <PickCard
              key={p.id}
              tone={tone}
              selected={fromId === p.id}
              onPress={() => onFromChange(p.id)}
              leading={<PondGlyph pond={p} tone={tone} selected={fromId === p.id} />}
              primary={displayPondName(p.name)}
              secondary={`${fmt.num(p.totalFish)} ตัว${p.ageDays != null ? ` · อายุ ${p.ageDays} วัน` : ''}`}
              badge={
                allowCrossFarm && farmId != null && p.farmId !== farmId ? (
                  <Pill tone="neutral">{displayFarmName(p.farmName)}</Pill>
                ) : null
              }
            />
          ))}
        </Col>
      )}

      <View style={{ height: 12 }} />
      <View ref={destSectionRef} />

      <StepLabel
        num={3}
        label="ไปยังบ่อ (ปลายทาง)"
        isCurrent={fromId != null && toId == null}
        isComplete={toId != null && fromId !== toId}
        tone={tone}
      />
      {fromId == null ? (
        <DisabledSlot msg="เลือกบ่อต้นทางก่อน" />
      ) : destPonds.length === 0 ? (
        <EmptyInline
          icon="fish"
          title="ไม่มีบ่อปลายทางให้เลือก"
          body="ต้องมีบ่ออื่นในฟาร์มก่อน"
        />
      ) : (
        <Col gap={6}>
          {destPonds.map((p) => {
            const isMaint = p.status === 'maintenance';
            return (
              <PickCard
                key={p.id}
                tone={tone}
                selected={toId === p.id}
                onPress={() => onToChange(p.id)}
                leading={<PondGlyph pond={p} tone={tone} selected={toId === p.id} />}
                primary={displayPondName(p.name)}
                secondary={
                  isMaint
                    ? 'ปิดบ่อ · จะเริ่มรอบใหม่ที่นี่'
                    : `${fmt.num(p.totalFish)} ตัว${p.ageDays != null ? ` · อายุ ${p.ageDays} วัน` : ''}`
                }
                badge={
                  isMaint ? (
                    <Pill tone="warn">ปิดบ่อ</Pill>
                  ) : allowCrossFarm && farmId != null && p.farmId !== farmId ? (
                    <Pill tone="neutral">{displayFarmName(p.farmName)}</Pill>
                  ) : null
                }
              />
            );
          })}
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radii.sm,
        backgroundColor: t.warnSoft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon.warn size={14} color={t.statusMaint} />
      <Text
        style={{
          fontSize: 12,
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
      // (the radio dot fills + completed-state border appears before we measure).
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
    <View
      style={{ opacity: ready ? 1 : 0.45 }}
      pointerEvents={ready ? 'auto' : 'none'}
    >
      {!ready && hint ? (
        <Text
          style={{
            marginBottom: 12,
            fontSize: 12,
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
