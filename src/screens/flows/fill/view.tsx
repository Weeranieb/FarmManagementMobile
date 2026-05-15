import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, Text, TextInput, UIManager, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Card, Input, Pill, TopBar } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { Icon } from '@/components/icons';
import { fmt, FISH_TH } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { PondModel } from '@/features/pond';
import { BottomBar, FieldRow, FishPicker, FlowBackBtn, PreviewCard } from '../shared';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  pond: PondModel;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  fishType: string;
  setFishType: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  pricePerUnit: string;
  setPricePerUnit: (v: string) => void;
  avgWeightKg: string;
  setAvgWeightKg: (v: string) => void;
  extraCost: string;
  setExtraCost: (v: string) => void;
  remark: string;
  setRemark: (v: string) => void;
  fishCost: number;
  extraTotal: number;
  grandTotal: number;
  totalWeightKg: number;
  stockBefore: number;
  stockAfter: number;
  delta: number;
  isStartCycle: boolean;
  date: Date;
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function FillView(props: Props) {
  const { step } = props;
  return step === 1 ? <FillStep1 {...props} /> : <FillStep2 {...props} />;
}

function FillStep1({
  pond,
  setStep,
  fishType,
  setFishType,
  amount,
  setAmount,
  pricePerUnit,
  setPricePerUnit,
  avgWeightKg,
  setAvgWeightKg,
  extraCost,
  setExtraCost,
  remark,
  setRemark,
  fishCost,
  extraTotal,
  grandTotal,
  stockBefore,
  stockAfter,
  delta,
  isStartCycle,
  date,
  goBack,
}: Props) {
  const { t } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={isStartCycle ? 'เริ่มรอบใหม่' : 'เติมปลา'}
        subtitle={`${pond.name}${pond.farmName ? ` · ${pond.farmName}` : ''}`}
        leading={<FlowBackBtn step={1} onPress={goBack} />}
        trailing={<Pill tone="fill">ขั้นที่ 1/2</Pill>}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 280 }}
        showsVerticalScrollIndicator={false}
      >
        {isStartCycle ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                alignItems: 'flex-start',
                padding: 12,
                backgroundColor: t.fillSoft,
                borderWidth: 1,
                borderColor: t.fill + '40',
                borderRadius: radii.sm,
              }}
            >
              <Icon.cycle size={16} color={t.fillInk} />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: t.fillInk,
                  fontFamily: type.family,
                  lineHeight: 19,
                }}
              >
                บ่อนี้กำลังปิดอยู่ — การเติมจะเริ่มรอบใหม่โดยอัตโนมัติ
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ padding: 20 }}>
          <FieldRow label="ชนิดปลา">
            <FishPicker
              types={pond.fishTypes?.length ? pond.fishTypes : ['nil', 'kaphong', 'kang', 'duk']}
              selected={fishType}
              onChange={setFishType}
            />
          </FieldRow>

          <FieldRow label="จำนวน" hint="ตัว">
            <Input
              big
              keyboardType="numeric"
              suffix="ตัว"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
            />
          </FieldRow>

          <FieldRow label="น้ำหนักเฉลี่ยต่อตัว" optional hint="กรัม / กก.">
            <Input
              keyboardType="numeric"
              suffix="กก."
              value={avgWeightKg}
              onChangeText={setAvgWeightKg}
              placeholder="0.05"
            />
          </FieldRow>

          <FieldRow label="ราคาต่อตัว">
            <Input
              keyboardType="numeric"
              suffix="฿/ตัว"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
              placeholder="0"
            />
          </FieldRow>

          <FieldRow label="วันที่">
            <DateField value={thaiDate.long(date)} />
          </FieldRow>

          <Collapsible
            icon={<Icon.plus size={16} color={t.ink} />}
            title="ค่าใช้จ่ายเพิ่มเติม"
            hint={extraTotal > 0 ? '1 รายการ' : '0 รายการ'}
          >
            <Input
              keyboardType="numeric"
              suffix="฿"
              value={extraCost}
              onChangeText={setExtraCost}
              placeholder="จำนวนเงิน เช่น ค่าขนส่ง"
            />
          </Collapsible>

          <View style={{ height: 10 }} />

          <Collapsible
            icon={<Icon.doc size={16} color={t.ink} />}
            title="หมายเหตุ"
            hint="ไม่บังคับ"
          >
            <TextInput
              value={remark}
              onChangeText={setRemark}
              placeholder="เพิ่มหมายเหตุ…"
              placeholderTextColor={t.inkMute}
              multiline
              style={{
                minHeight: 80,
                padding: 12,
                borderRadius: radii.sm,
                borderWidth: 1.5,
                borderColor: t.border,
                backgroundColor: t.surface,
                color: t.ink,
                fontFamily: type.family,
                fontSize: 14,
                textAlignVertical: 'top',
              }}
            />
          </Collapsible>
        </View>
      </ScrollView>

      <BottomBar>
        <Col gap={10}>
          <PreviewCard
            tone="fill"
            rows={[
              ['ต้นทุนปลา', fmt.baht(fishCost)],
              ['ค่าใช้จ่ายเพิ่มเติม', fmt.baht(extraTotal)],
            ]}
            totalLabel="รวมทั้งหมด"
            total={fmt.baht(grandTotal)}
          />
          <StockImpactRow
            before={stockBefore}
            after={stockAfter}
            delta={delta}
            accent={t.fill}
          />
          <Btn tone="fill" size="lg" block onPress={() => setStep(2)} disabled={!amount}>
            ตรวจสอบและบันทึก
          </Btn>
        </Col>
      </BottomBar>
    </View>
  );
}

function FillStep2({
  pond,
  setStep,
  fishType,
  amount,
  pricePerUnit,
  avgWeightKg,
  fishCost,
  extraTotal,
  grandTotal,
  totalWeightKg,
  stockBefore,
  stockAfter,
  delta,
  isStartCycle,
  date,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();
  const amountNum = parseInt(amount || '0', 10);
  const priceNum = parseFloat(pricePerUnit || '0');
  const fishLabel = FISH_TH[fishType] ?? fishType;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title="ตรวจสอบและยืนยัน"
        subtitle={`เติมปลา · ${pond.name}`}
        leading={<FlowBackBtn step={2} onPress={goBack} />}
        trailing={<Pill tone="fill">ขั้นที่ 2/2</Pill>}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            padding: 18,
            backgroundColor: t.fillSoft,
            borderWidth: 1.5,
            borderColor: t.fill + '40',
            borderRadius: radii.lg,
          }}
        >
          <Pill tone="fill">
            <Row gap={4}>
              <Icon.plus size={12} color={t.fillInk} />
              <Text style={{ color: t.fillInk, fontSize: 12, fontFamily: type.familyMedium }}>
                เติมปลา
              </Text>
            </Row>
          </Pill>
          <Text
            style={{
              marginTop: 10,
              fontFamily: type.familyNumBold,
              fontSize: 34,
              color: t.fillInk,
              letterSpacing: -1,
            }}
          >
            +{fmt.num(amountNum)} ตัว
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 14,
              color: t.fillInk,
              opacity: 0.85,
              fontFamily: type.family,
            }}
          >
            {fishLabel} · ราคา {fmt.baht(priceNum)}/ตัว
            {isStartCycle ? ' · เริ่มรอบใหม่' : ''}
          </Text>
        </View>

        <ReviewSection title="รายละเอียด">
          <ReviewRow l="ชนิดปลา" v={`${fishLabel} (${fishType})`} />
          <ReviewRow l="จำนวน" v={`${fmt.num(amountNum)} ตัว`} />
          {avgWeightKg ? (
            <>
              <ReviewRow l="น้ำหนักเฉลี่ย" v={`${avgWeightKg} กก./ตัว`} />
              <ReviewRow l="น้ำหนักรวม" v={fmt.kg(totalWeightKg)} />
            </>
          ) : null}
          <ReviewRow l="ราคาต่อตัว" v={fmt.bahtPrecise(priceNum)} />
          <ReviewRow l="วันที่บันทึก" v={thaiDate.long(date)} last />
        </ReviewSection>

        <ReviewSection title="ค่าใช้จ่าย">
          <ReviewRow l="ต้นทุนปลาพื้นฐาน" v={fmt.baht(fishCost)} />
          <ReviewRow l="ค่าใช้จ่ายเพิ่มเติม" v={fmt.baht(extraTotal)} />
          <ReviewRow l="รวมทั้งหมด" v={fmt.baht(grandTotal)} big last />
        </ReviewSection>

        <ReviewSection title="ผลกระทบต่อปริมาณปลา">
          <Row gap={10} style={{ paddingVertical: 8 }}>
            <ImpactCell label="ก่อน" v={fmt.num(stockBefore)} />
            <Icon.arrow size={18} color={t.inkSoft} />
            <ImpactCell label="หลัง" v={fmt.num(stockAfter)} accent={t.fill} />
            <ImpactCell label="เพิ่ม" v={`+${fmt.num(delta)}`} accent={t.fill} />
          </Row>
        </ReviewSection>
      </ScrollView>

      <BottomBar>
        <Row gap={10}>
          <Btn
            variant="ghost"
            tone="neutral"
            size="lg"
            style={{ flex: 1 }}
            onPress={() => setStep(1)}
          >
            ย้อนกลับเพื่อแก้ไข
          </Btn>
          <Btn
            tone="fill"
            size="lg"
            style={{ flex: 1.4 }}
            onPress={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'กำลังบันทึก…' : 'ยืนยัน'}
          </Btn>
        </Row>
      </BottomBar>
    </View>
  );
}

function DateField({ value }: { value: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: 56,
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Icon.calendar size={18} color={t.inkSoft} />
      <Text style={{ flex: 1, fontSize: 15, color: t.ink, fontFamily: type.family }}>{value}</Text>
      <Icon.chevR size={16} color={t.inkMute} />
    </View>
  );
}

function Collapsible({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };
  return (
    <View>
      <Pressable
        onPress={toggle}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: radii.sm,
          backgroundColor: t.surfaceAlt,
          borderWidth: 1,
          borderColor: t.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Row gap={8}>
          {icon}
          <Text style={{ fontFamily: type.familySemi, fontSize: 14, color: t.ink }}>{title}</Text>
        </Row>
        <Row gap={6}>
          {hint ? (
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>{hint}</Text>
          ) : null}
          <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
            <Icon.arrowDown size={14} color={t.inkSoft} />
          </View>
        </Row>
      </Pressable>
      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}

function StockImpactRow({
  before,
  after,
  delta,
  accent,
}: {
  before: number;
  after: number;
  delta: number;
  accent: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
      }}
    >
      <StockCell label="ก่อน" v={fmt.num(before)} />
      <Icon.arrow size={14} color={t.inkSoft} />
      <StockCell label="หลัง" v={fmt.num(after)} accent={accent} />
      <Text
        style={{
          marginLeft: 'auto',
          fontFamily: type.familyNumBold,
          fontSize: 12,
          color: accent,
        }}
      >
        {delta > 0 ? '+' : ''}
        {fmt.num(delta)}
      </Text>
    </View>
  );
}

function StockCell({ label, v, accent }: { label: string; v: string; accent?: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.xs,
      }}
    >
      <Text style={{ fontSize: 10, color: t.inkMute, fontFamily: type.familyMedium }}>{label}</Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 14,
          color: accent ?? t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: type.familyBold,
          color: t.inkSoft,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Card padded={false}>
        <View style={{ paddingHorizontal: 16 }}>{children}</View>
      </Card>
    </View>
  );
}

function ReviewRow({
  l,
  v,
  big,
  last,
}: {
  l: string;
  v: string;
  big?: boolean;
  last?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: t.inkSoft,
          fontFamily: big ? type.familyBold : type.family,
        }}
      >
        {l}
      </Text>
      <Text
        style={{
          fontFamily: big ? type.familyNumBold : type.familyNumSemi,
          fontSize: big ? 18 : 14,
          color: t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}

function ImpactCell({
  label,
  v,
  accent,
}: {
  label: string;
  v: string;
  accent?: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.md,
      }}
    >
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 18,
          color: accent ?? t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}
