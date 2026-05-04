import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { FieldRow, PreviewCard } from './FlowShared';
import { fmt, FISH_TH } from '@/utils/fmt';
import { merchants, ponds, sizeGrades } from '@/mock/data';
import { useSellPond } from '@/api/queries';
import { useAuthStore } from '@/store/auth';

type Props = {
  pondId: number;
  onClose?: () => void;
};

export function SellFlow({ pondId, onClose }: Props) {
  const { t } = useTheme();
  const pond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [merchantId, setMerchantId] = useState<number>(merchants[0]?.id ?? -1);
  const [gradeId, setGradeId] = useState<number>(sizeGrades[0]?.id ?? -1);

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(pricePerKg) || 0;
    return Math.round(a * p);
  }, [amount, pricePerKg]);
  const merchant = merchants.find((m) => m.id === merchantId);
  const grade = sizeGrades.find((g) => g.id === gradeId);
  const sellMutation = useSellPond(pondId);
  const isAuthed = useAuthStore((s) => s.token != null);

  const handleConfirm = async () => {
    if (!isAuthed) {
      onClose?.();
      return;
    }
    try {
      await sellMutation.mutateAsync({
        amount: parseFloat(amount || '0'),
        pricePerKg: parseFloat(pricePerKg || '0'),
        merchantId,
        sizeGradeId: gradeId,
      });
      onClose?.();
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'บันทึกไม่สำเร็จ';
      Alert.alert('ขายปลาไม่สำเร็จ', msg);
    }
  };

  if (!pond) return null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `ขายปลา · ${pond.name}` : 'ตรวจสอบข้อมูล'}
        leading={
          <Pressable
            onPress={step === 1 ? onClose : () => setStep(1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {step === 1 ? (
              <Icon.x size={18} color={t.ink} />
            ) : (
              <Icon.back size={18} color={t.ink} />
            )}
          </Pressable>
        }
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
                disabled={sellMutation.isPending}
              >
                {sellMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </Btn>
            </Row>
          </BottomBar>
        </>
      )}
    </View>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: t.bg,
        borderTopWidth: 1,
        borderTopColor: t.border,
      }}
    >
      {children}
    </View>
  );
}
