import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, TopBar } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH } from '@/utils/fmt';
import type { MerchantOption, PondModel, SizeGradeOption } from '@/features/pond';
import { BottomBar, FieldRow, FlowBackBtn, PreviewCard } from '../shared';

type Props = {
  pond: PondModel;
  merchants: MerchantOption[];
  sizeGrades: SizeGradeOption[];
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  amount: string;
  setAmount: (v: string) => void;
  pricePerKg: string;
  setPricePerKg: (v: string) => void;
  merchantId: number;
  setMerchantId: (id: number) => void;
  gradeId: number;
  setGradeId: (id: number) => void;
  merchant: MerchantOption | undefined;
  grade: SizeGradeOption | undefined;
  total: number;
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function SellView({
  pond,
  merchants,
  sizeGrades,
  step,
  setStep,
  amount,
  setAmount,
  pricePerKg,
  setPricePerKg,
  merchantId,
  setMerchantId,
  gradeId,
  setGradeId,
  merchant,
  grade,
  total,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `ขายปลา · ${pond.name}` : 'ตรวจสอบข้อมูล'}
        leading={<FlowBackBtn step={step} onPress={goBack} />}
      />

      {step === 1 ? (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
            <FieldRow label="ผู้รับซื้อ">
              <Col gap={8}>
                {merchants.map((m) => {
                  const sel = m.id === merchantId;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMerchantId(m.id)}
                      style={{
                        padding: 14,
                        borderRadius: radii.md,
                        borderWidth: 1.5,
                        borderColor: sel ? t.sell : t.border,
                        backgroundColor: sel ? t.sellSoft : t.surface,
                      }}
                    >
                      <Row justify="space-between">
                        <Col gap={2}>
                          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>
                            {m.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                            {m.location} · {m.contactNumber}
                          </Text>
                        </Col>
                      </Row>
                    </Pressable>
                  );
                })}
              </Col>
            </FieldRow>

            <FieldRow label="ขนาดปลา">
              <Row gap={8} wrap>
                {sizeGrades.map((g) => {
                  const sel = g.id === gradeId;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => setGradeId(g.id)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 9999,
                        backgroundColor: sel ? t.sellSoft : t.surface,
                        borderWidth: 1.5,
                        borderColor: sel ? t.sell : t.border,
                      }}
                    >
                      <Text
                        style={{
                          color: sel ? t.sellInk : t.inkSoft,
                          fontFamily: type.familySemi,
                          fontSize: 13,
                        }}
                      >
                        {g.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </Row>
            </FieldRow>

            <FieldRow label="น้ำหนัก" hint="หน่วย: กก.">
              <Input
                big
                keyboardType="numeric"
                suffix="กก."
                value={amount}
                onChangeText={setAmount}
                placeholder="0.0"
              />
            </FieldRow>
            <FieldRow label="ราคาต่อกก." hint="บาท / กก.">
              <Input
                big
                keyboardType="numeric"
                suffix="฿/กก."
                value={pricePerKg}
                onChangeText={setPricePerKg}
                placeholder="0"
              />
            </FieldRow>

            <View style={{ marginTop: 8 }}>
              <PreviewCard
                tone="sell"
                rows={[
                  ['ชนิด', pond.fishTypes.map((f) => FISH_TH[f] ?? f).join(', ')],
                  ['ขนาด', grade?.name ?? '—'],
                  ['น้ำหนัก', fmt.kg(parseFloat(amount || '0'))],
                  ['ราคา', `${fmt.baht(parseFloat(pricePerKg || '0'))}/กก.`],
                  ['ผู้รับ', merchant?.name ?? '—'],
                ]}
                totalLabel="รายรับรวม"
                total={fmt.baht(total)}
              />
            </View>
          </ScrollView>
          <BottomBar>
            <Btn
              tone="sell"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={!amount || !pricePerKg}
            >
              ถัดไป
            </Btn>
          </BottomBar>
        </>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 140 }}>
            <Text style={{ fontSize: 22, fontFamily: type.familyBold, color: t.ink }}>
              ขายปลาที่ {pond.name}
            </Text>
            <PreviewCard
              tone="sell"
              rows={[
                ['ขนาด', grade?.name ?? '—'],
                ['น้ำหนัก', fmt.kg(parseFloat(amount || '0'))],
                ['ราคาต่อกก.', `${fmt.baht(parseFloat(pricePerKg || '0'))}/กก.`],
                ['ผู้รับ', merchant?.name ?? '—'],
              ]}
              totalLabel="รายรับรวม"
              total={fmt.baht(total)}
            />
          </ScrollView>
          <BottomBar>
            <Row gap={8}>
              <Btn
                tone="sell"
                variant="ghost"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => setStep(1)}
              >
                แก้ไข
              </Btn>
              <Btn
                tone="sell"
                size="lg"
                style={{ flex: 1 }}
                onPress={handleConfirm}
                disabled={isPending}
              >
                {isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </Btn>
            </Row>
          </BottomBar>
        </>
      )}
    </View>
  );
}
