import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, TopBar } from '@/components/ui';
import { DateField } from '@/components/date-selector';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH, displayFarmName, displayPondName } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';
import { BottomBar, CloseAfterActionToggle, FieldRow, FishPicker, FlowBackBtn, NoteField } from '../shared';
import { DimWrap, InlineMovePicker, PickerValidationBanner, useAutoAdvance } from '../picker';
import { AdditionalCostsEditor, type CostRow } from '../additional-costs';
import {
  AdditionalCostsList,
  ImpactCell,
  ReviewRow,
  ReviewSection,
  WarningBanner,
} from '../review';

type Props = {
  fromFab: boolean;
  farms: FarmModel[];
  pondsInFarm: PondModel[];
  defaultFarmId: number | null;
  farmId: number | null;
  setFarmId: (id: number) => void;
  fromId: number | null;
  setFromId: (id: number) => void;
  toId: number | null;
  setToId: (id: number) => void;
  fromPond: PondModel | null;
  toPond: PondModel | undefined;
  validationMsg: string | null;
  amount: string;
  setAmount: (v: string) => void;
  pricePerUnit: string;
  setPricePerUnit: (v: string) => void;
  avgWeightKg: string;
  setAvgWeightKg: (v: string) => void;
  fishType: string;
  setFishType: (v: string) => void;
  fishTypeOptions: string[];
  additionalCosts: CostRow[];
  setAdditionalCosts: (rows: CostRow[]) => void;
  fishCost: number;
  extraTotal: number;
  grandTotal: number;
  totalWeightKg: number;
  halfExtra: number;
  sourceFishRevenue: number;
  sourceAdditionalCost: number;
  sourceNetEffect: number;
  destFishCost: number;
  destAdditionalCost: number;
  destTotalCost: number;
  amountError: string | null;
  date: Date;
  setDate: (d: Date) => void;
  markToClose: boolean;
  setMarkToClose: (v: boolean) => void;
  remark: string;
  setRemark: (v: string) => void;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  after: { from: number; to: number };
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function MoveView({
  fromFab,
  farms,
  pondsInFarm,
  defaultFarmId,
  farmId,
  setFarmId,
  fromId,
  setFromId,
  toId,
  setToId,
  fromPond,
  toPond,
  validationMsg,
  amount,
  setAmount,
  pricePerUnit,
  setPricePerUnit,
  avgWeightKg,
  setAvgWeightKg,
  fishType,
  setFishType,
  fishTypeOptions,
  additionalCosts,
  setAdditionalCosts,
  fishCost,
  extraTotal,
  grandTotal,
  totalWeightKg,
  halfExtra,
  sourceFishRevenue,
  sourceAdditionalCost,
  sourceNetEffect,
  destFishCost,
  destAdditionalCost,
  destTotalCost,
  amountError,
  date,
  setDate,
  markToClose,
  setMarkToClose,
  remark,
  setRemark,
  step,
  setStep,
  after,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const fieldsReady = fromPond != null && toPond != null && fromPond.id !== toPond.id;

  const { scrollRef, scrollToAnchor } = useAutoAdvance();
  const sourceAnchorRef = useRef<View | null>(null);
  const destAnchorRef = useRef<View | null>(null);
  const formAnchorRef = useRef<View | null>(null);

  const handleFarmPick = (id: number) => {
    setFarmId(id);
    scrollToAnchor(sourceAnchorRef);
  };
  const handleSourcePick = (id: number) => {
    setFromId(id);
    scrollToAnchor(destAnchorRef);
  };
  const handleDestPick = (id: number) => {
    setToId(id);
    scrollToAnchor(formAnchorRef);
  };

  if (step === 2) {
    if (!fromPond) return null;
    const fromLabel = displayPondName(fromPond.name);
    const fromFarmLabel = fromPond.farmName ? displayFarmName(fromPond.farmName) : '';
    const toLabel = toPond ? displayPondName(toPond.name) : '—';
    const toFarmLabel = toPond?.farmName ? displayFarmName(toPond.farmName) : '';
    const amountNum = parseInt(amount || '0', 10);
    const fishLabel = FISH_TH[fishType] ?? fishType;
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <TopBar
          title={tx('flows.reviewConfirm')}
          subtitle={tx('flows.move.titleWith', { pond: `${fromLabel} → ${toLabel}` })}
          leading={<FlowBackBtn step={2} onPress={goBack} />}
          trailing={<Pill tone="move">{tx('flows.step2')}</Pill>}
        />
        <ScrollView
          delaysContentTouches={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero summary */}
          <View
            style={{
              paddingTop: 20,
              paddingBottom: 18,
              paddingHorizontal: 18,
              backgroundColor: t.moveSoft,
              borderWidth: 1.5,
              borderColor: t.move + '40',
              borderRadius: radii.lg,
            }}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 7,
                paddingHorizontal: 12,
                borderRadius: 9999,
                backgroundColor: t.move,
              }}
            >
              <Icon.swap size={14} color="#ffffff" stroke={2.4} />
              <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: type.familyBold }}>
                {tx('flows.move.title')}
              </Text>
            </View>
            <Text
              style={{
                marginTop: 12,
                fontFamily: type.familyNumBold,
                fontSize: 30,
                color: t.moveInk,
                letterSpacing: -0.6,
              }}
            >
              {tx('flows.countFishN', { count: fmt.num(amountNum) })}
            </Text>
            <Row gap={8} style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: t.moveInk,
                  opacity: 0.85,
                  fontFamily: type.familySemi,
                }}
              >
                {fromLabel}
              </Text>
              <Icon.arrow size={14} color={t.moveInk} />
              <Text
                style={{
                  fontSize: 14,
                  color: t.moveInk,
                  opacity: 0.85,
                  fontFamily: type.familySemi,
                }}
              >
                {toLabel}
              </Text>
            </Row>
          </View>

          <ReviewSection title={tx('flows.general')}>
            <ReviewRow
              l={tx('flows.move.fromPond')}
              v={fromFarmLabel ? `${fromLabel} · ${fromFarmLabel}` : fromLabel}
            />
            <ReviewRow
              l={tx('flows.move.toPond')}
              v={toFarmLabel ? `${toLabel} · ${toFarmLabel}` : toLabel}
            />
            <ReviewRow l={tx('flows.recordDate')} v={thaiDate.long(date)} />
            <ReviewRow
              l={tx('flows.move.afterMove')}
              v={
                markToClose
                  ? tx('flows.closePondNamed', { pond: fromLabel })
                  : tx('flows.move.keepSourceOpen')
              }
              last
            />
          </ReviewSection>

          <ReviewSection title={tx('flows.fishDetails')}>
            <ReviewRow l={tx('flows.species')} v={fishLabel} />
            <ReviewRow l={tx('flows.count')} v={tx('flows.countFishN', { count: fmt.num(amountNum) })} />
            {avgWeightKg ? (
              <>
                <ReviewRow
                  l={tx('flows.avgWeight')}
                  v={tx('flows.kgPerFishN', { value: avgWeightKg })}
                />
                <ReviewRow l={tx('flows.totalWeight')} v={fmt.kg(totalWeightKg)} />
              </>
            ) : null}
            <ReviewRow
              l={tx('flows.pricePerKg')}
              v={tx('flows.perKgValue', {
                value: fmt.bahtPrecise(parseFloat(pricePerUnit || '0')),
              })}
            />
            <ReviewRow l={tx('flows.sell.fishValue')} v={fmt.baht(fishCost)} last />
          </ReviewSection>

          <ReviewSection
            title={tx('flows.extraCostsCount', { count: countNonEmpty(additionalCosts) })}
          >
            <AdditionalCostsList rows={additionalCosts} />
          </ReviewSection>

          {remark ? (
            <ReviewSection title={tx('flows.notes')}>
              <Text
                style={{
                  paddingVertical: 12,
                  fontSize: 14,
                  color: t.ink,
                  fontFamily: type.family,
                }}
              >
                {remark}
              </Text>
            </ReviewSection>
          ) : null}

          <MoveCostSplitPanel
            fromLabel={fromLabel}
            toLabel={toLabel}
            fishValue={fishCost}
            halfExtra={halfExtra}
            extraTotal={extraTotal}
            grandTotal={grandTotal}
            sourceFishRevenue={sourceFishRevenue}
            sourceAdditionalCost={sourceAdditionalCost}
            sourceNetEffect={sourceNetEffect}
            destFishCost={destFishCost}
            destAdditionalCost={destAdditionalCost}
            destTotalCost={destTotalCost}
          />

          <ReviewSection title={tx('flows.stockImpact')}>
            <Col gap={10} style={{ paddingVertical: 14 }}>
              <Col gap={6}>
                <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familySemi }}>
                  {tx('flows.move.fromPondWith', { pond: fromLabel })}
                </Text>
                <Row gap={10}>
                  <ImpactCell label={tx('flows.before')} v={fmt.num(fromPond.totalFish)} />
                  <Icon.arrow size={16} color={t.inkSoft} />
                  <ImpactCell label={tx('flows.after')} v={fmt.num(after.from)} accent={t.move} />
                  <ImpactCell
                    label={tx('flows.move.reduce')}
                    v={`-${fmt.num(amountNum)}`}
                    accent={t.danger}
                  />
                </Row>
              </Col>
              {toPond ? (
                <Col gap={6}>
                  <Text
                    style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familySemi }}
                  >
                    {tx('flows.move.toPondWith', { pond: toLabel })}
                  </Text>
                  <Row gap={10}>
                    <ImpactCell label={tx('flows.before')} v={fmt.num(toPond.totalFish)} />
                    <Icon.arrow size={16} color={t.inkSoft} />
                    <ImpactCell label={tx('flows.after')} v={fmt.num(after.to)} accent={t.move} />
                    <ImpactCell
                      label={tx('flows.addLabel')}
                      v={`+${fmt.num(amountNum)}`}
                      accent={t.fill}
                    />
                  </Row>
                </Col>
              ) : null}
            </Col>
          </ReviewSection>

          <WarningBanner />
        </ScrollView>
        <BottomBar>
          <Btn
            tone="move"
            size="lg"
            block
            onPress={handleConfirm}
            disabled={isPending}
          >
            {isPending ? tx('common.saving') : tx('flows.move.confirm')}
          </Btn>
        </BottomBar>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={tx('flows.move.title')}
        subtitle={
          fromFab && !fieldsReady
            ? tx('flows.fill.pickFarmPond')
            : fromPond
              ? toPond && toPond.id !== fromPond.id
                ? `${displayPondName(fromPond.name)} → ${displayPondName(toPond.name)}`
                : `${displayPondName(fromPond.name)}${fromPond.farmName ? ` · ${displayFarmName(fromPond.farmName)}` : ''}`
              : undefined
        }
        leading={<FlowBackBtn step={1} onPress={goBack} />}
        trailing={<Pill tone="move">{tx('flows.step1')}</Pill>}
      />

      <ScrollView
        delaysContentTouches={false}
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Both entries run the same stepped picker — from pond detail the
            source is pinned as an already-completed step, so the destination
            is still an explicit choice instead of a silent default. That entry
            waits for the source pond to load rather than flashing the FAB
            variant's farm + source steps for a frame. */}
        {fromFab || fromPond ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <InlineMovePicker
              farms={farms}
              ponds={pondsInFarm}
              defaultFarmId={defaultFarmId}
              farmId={farmId}
              fromId={fromId}
              toId={toId}
              lockedFrom={fromFab ? null : fromPond}
              onFarmChange={handleFarmPick}
              onFromChange={handleSourcePick}
              onToChange={handleDestPick}
              sourceSectionRef={sourceAnchorRef}
              destSectionRef={destAnchorRef}
            />
          </View>
        ) : null}

        <View ref={formAnchorRef} />
        <View style={{ padding: 20 }}>
          <DimWrap
            ready={fieldsReady}
            hint={
              fromFab
                ? tx('flows.move.pickFarmPondAmount')
                : tx('flows.move.pickDestThenAmount')
            }
          >
            <FieldRow label={tx('flows.species')}>
              <FishPicker types={fishTypeOptions} selected={fishType} onChange={setFishType} tone="move" />
            </FieldRow>

            <FieldRow label={tx('flows.move.amount')}>
              <Input
                big
                keyboardType="number-pad"
                suffix={tx('unit.fish')}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
              {amountError ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: t.danger,
                    fontFamily: type.familySemi,
                  }}
                >
                  {amountError}
                </Text>
              ) : fromPond ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: t.inkMute,
                    fontFamily: type.family,
                  }}
                >
                  {tx('flows.move.sourceStock', { count: fmt.num(fromPond.totalFish) })}
                </Text>
              ) : null}
            </FieldRow>

            <FieldRow label={tx('flows.avgWeightPer')}>
              <Input
                keyboardType="decimal-pad"
                suffix={tx('flows.kgPerFish')}
                value={avgWeightKg}
                onChangeText={setAvgWeightKg}
                placeholder="0.05"
              />
            </FieldRow>

            <FieldRow label={tx('flows.pricePerKg')}>
              <Input
                keyboardType="decimal-pad"
                suffix={tx('flows.bahtPerKg')}
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0"
              />
            </FieldRow>

            <FieldRow label={tx('daily.dateCol')}>
              <DateField value={date} onChange={setDate} />
            </FieldRow>

            <FieldRow label={tx('flows.extraCosts')} optional>
              <AdditionalCostsEditor
                tone="move"
                rows={additionalCosts}
                onChange={setAdditionalCosts}
              />
            </FieldRow>

            <FieldRow label={tx('flows.notes')}>
              <NoteField value={remark} onChange={setRemark} />
            </FieldRow>

            <CloseAfterActionToggle
              value={markToClose}
              onChange={setMarkToClose}
              label={tx('flows.move.closeSource')}
              activeHelper={tx('flows.move.restingHelper')}
              inactiveHelper={tx('flows.move.keepSourceSub')}
              pondName={fromPond ? displayPondName(fromPond.name) : ''}
            />

            {fieldsReady && fromPond ? (
              <View style={{ marginTop: 8 }}>
                <MoveStep1Preview
                  fromText={`${displayPondName(fromPond.name)} · ${fmt.num(fromPond.totalFish)} → ${fmt.num(after.from)}`}
                  toText={
                    toPond
                      ? `${displayPondName(toPond.name)} · ${fmt.num(toPond.totalFish)} → ${fmt.num(after.to)}`
                      : '—'
                  }
                  amountText={tx('flows.countFishN', {
                    count: fmt.num(parseInt(amount || '0', 10)),
                  })}
                  fishValue={fmt.baht(fishCost)}
                  extraText={fmt.baht(extraTotal)}
                />
              </View>
            ) : null}
          </DimWrap>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Col gap={14}>
            {!fieldsReady ? <PickerValidationBanner msg={validationMsg} /> : null}
            <Btn
              tone="move"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={
                !fieldsReady ||
                !amount ||
                parseInt(amount || '0', 10) <= 0 ||
                parseFloat(avgWeightKg || '0') <= 0 ||
                parseFloat(pricePerUnit || '0') <= 0 ||
                amountError != null
              }
            >
              {tx('daily.next')}
            </Btn>
          </Col>
        </View>
      </ScrollView>
    </View>
  );
}

function countNonEmpty(rows: CostRow[]): number {
  return rows.filter((r) => r.category.trim() || parseFloat(r.amount) > 0).length;
}

function MoveStep1Preview({
  fromText,
  toText,
  amountText,
  fishValue,
  extraText,
}: {
  fromText: string;
  toText: string;
  amountText: string;
  fishValue: string;
  extraText: string;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: t.moveSoft,
        borderWidth: 1,
        borderColor: t.moveInk + '30',
        borderRadius: radii.md,
      }}
    >
      <Col gap={6}>
        <PreviewRow label={tx('flows.from')} value={fromText} />
        <PreviewRow label={tx('flows.to')} value={toText} />
        <PreviewRow label={tx('flows.move.amountShort')} value={amountText} />
        <PreviewRow label={tx('flows.sell.fishValue')} value={fishValue} bold />
        <PreviewRow label={tx('flows.extraCosts')} value={extraText} bold />
      </Col>
    </View>
  );
}

function PreviewRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Row justify="space-between">
      <Text
        style={{
          color: t.moveInk,
          opacity: bold ? 1 : 0.8,
          fontSize: 13,
          fontFamily: bold ? type.familyBold : type.family,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: t.moveInk,
          fontSize: bold ? 14 : 13,
          fontFamily: bold ? type.familyNumBold : type.familyNumSemi,
        }}
      >
        {value}
      </Text>
    </Row>
  );
}

function MoveCostSplitPanel({
  fromLabel,
  toLabel,
  fishValue,
  halfExtra,
  extraTotal,
  grandTotal,
  sourceFishRevenue,
  sourceAdditionalCost,
  sourceNetEffect,
  destFishCost,
  destAdditionalCost,
  destTotalCost,
}: {
  fromLabel: string;
  toLabel: string;
  fishValue: number;
  halfExtra: number;
  extraTotal: number;
  grandTotal: number;
  sourceFishRevenue: number;
  sourceAdditionalCost: number;
  sourceNetEffect: number;
  destFishCost: number;
  destAdditionalCost: number;
  destTotalCost: number;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ marginTop: 18, gap: 12 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.familyBold,
          color: t.ink,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {tx('flows.move.accountingTitle')}
      </Text>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        {tx('flows.move.accountingBody')}
        {extraTotal > 0 ? ` ${tx('flows.sharedCostNote')}` : ''}
      </Text>

      <PerspectiveCard
        tone="sell"
        title={tx('flows.move.fromPondWith', { pond: fromLabel })}
        subtitle={tx('flows.sell.sellOut')}
        rows={[
          [tx('flows.sell.fishValueRevenue'), `+${fmt.baht(sourceFishRevenue)}`],
          [tx('flows.sharedCostHalf'), `-${fmt.baht(sourceAdditionalCost)}`],
        ]}
        totalLabel={tx('flows.sumPnl')}
        totalValue={`${sourceNetEffect >= 0 ? '+' : ''}${fmt.baht(sourceNetEffect)}`}
      />

      <PerspectiveCard
        tone="fill"
        title={tx('flows.move.toPondWith', { pond: toLabel })}
        subtitle={tx('flows.move.receive')}
        rows={[
          [tx('flows.fill.fishValueCost'), fmt.baht(destFishCost)],
          [tx('flows.sharedCostHalf'), fmt.baht(destAdditionalCost)],
        ]}
        totalLabel={tx('flows.totalCost')}
        totalValue={fmt.baht(destTotalCost)}
      />

      <View
        style={{
          marginTop: 4,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: t.border,
          borderRadius: radii.md,
        }}
      >
        <Row justify="space-between" align="baseline">
          <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 13, color: t.ink, fontFamily: type.familySemi }}>
              {tx('flows.move.totalValue')}
            </Text>
            <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
              {tx('flows.move.valueBreakdown', { value: fmt.baht(fishValue) })}
              {extraTotal > 0
                ? ` ${tx('flows.extraCostsPlus', { amount: fmt.baht(extraTotal) })}`
                : ''}
            </Text>
          </Col>
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>
            {fmt.baht(grandTotal)}
          </Text>
        </Row>
      </View>
    </View>
  );
}

function PerspectiveCard({
  tone,
  title,
  subtitle,
  rows,
  totalLabel,
  totalValue,
}: {
  tone: 'fill' | 'sell';
  title: string;
  subtitle: string;
  rows: [string, string][];
  totalLabel: string;
  totalValue: string;
}) {
  const { t } = useTheme();
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft, border: t.fill },
    sell: { fg: t.sellInk, bg: t.sellSoft, border: t.sell },
  } as const;
  const { fg, bg, border } = accentMap[tone];
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border + '60',
        borderLeftWidth: 4,
        borderLeftColor: border,
        borderRadius: radii.md,
      }}
    >
      <Row justify="space-between" align="center" style={{ marginBottom: 10 }}>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 14, color: fg, fontFamily: type.familyBold }}>{title}</Text>
          <Text style={{ fontSize: 11, color: fg, opacity: 0.75, fontFamily: type.family }}>
            {subtitle}
          </Text>
        </Col>
      </Row>
      <Col gap={6}>
        {rows.map(([label, value], i) => (
          <Row key={i} justify="space-between">
            <Text style={{ color: fg, opacity: 0.85, fontSize: 13, fontFamily: type.family }}>
              {label}
            </Text>
            <Text style={{ color: fg, fontSize: 13, fontFamily: type.familyNumSemi }}>
              {value}
            </Text>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: fg + '30', marginVertical: 4 }} />
        <Row justify="space-between" align="baseline">
          <Text style={{ color: fg, fontSize: 13, fontFamily: type.familyBold }}>{totalLabel}</Text>
          <Text style={{ color: fg, fontFamily: type.familyNumBold, fontSize: 18 }}>
            {totalValue}
          </Text>
        </Row>
      </Col>
    </View>
  );
}

