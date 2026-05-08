import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, TopBar } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH } from '@/utils/fmt';
import type { PondModel } from '@/features/pond';
import { BottomBar, FieldRow, FlowBackBtn, PreviewCard } from '../shared';

type Props = {
  fromPond: PondModel;
  toPond: PondModel | undefined;
  candidates: PondModel[];
  toId: number;
  setToId: (id: number) => void;
  amount: string;
  setAmount: (v: string) => void;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  after: { from: number; to: number };
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function MoveView({
  fromPond,
  toPond,
  candidates,
  toId,
  setToId,
  amount,
  setAmount,
  step,
  setStep,
  after,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `ย้ายปลา · ${fromPond.name}` : 'ตรวจสอบข้อมูล'}
        leading={<FlowBackBtn step={step} onPress={goBack} />}
      />

      {step === 1 ? (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
            <FieldRow label="จำนวนที่ย้าย" hint="หน่วย: ตัว">
              <Input
                big
                keyboardType="numeric"
                suffix="ตัว"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
            </FieldRow>

            <FieldRow label="ปลายทาง">
              <Col gap={8}>
                {candidates.map((p) => {
                  const sel = p.id === toId;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setToId(p.id)}
                      style={{
                        padding: 14,
                        borderRadius: radii.md,
                        borderWidth: 1.5,
                        borderColor: sel ? t.move : t.border,
                        backgroundColor: sel ? t.moveSoft : t.surface,
                      }}
                    >
                      <Row justify="space-between">
                        <Col gap={2}>
                          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>
                            {p.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                            {p.farmName} · {fmt.num(p.totalFish)} ตัว
                          </Text>
                        </Col>
                        <Pill tone="ghost">
                          {p.fishTypes.map((f) => FISH_TH[f] ?? f).join(', ') || '—'}
                        </Pill>
                      </Row>
                    </Pressable>
                  );
                })}
              </Col>
            </FieldRow>

            <View style={{ marginTop: 8 }}>
              <PreviewCard
                tone="move"
                rows={[
                  [
                    'จาก',
                    `${fromPond.name} · ${fmt.num(fromPond.totalFish)} → ${fmt.num(after.from)}`,
                  ],
                  [
                    'ไป',
                    toPond
                      ? `${toPond.name} · ${fmt.num(toPond.totalFish)} → ${fmt.num(after.to)}`
                      : '—',
                  ],
                ]}
                totalLabel="จำนวนย้าย"
                total={`${fmt.num(parseInt(amount || '0', 10))} ตัว`}
              />
            </View>
          </ScrollView>
          <BottomBar>
            <Btn
              tone="move"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={!toPond || !amount}
            >
              ถัดไป
            </Btn>
          </BottomBar>
        </>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }}>
            <Text style={{ fontSize: 22, fontFamily: type.familyBold, color: t.ink }}>
              ย้าย {fmt.num(parseInt(amount || '0', 10))} ตัว
            </Text>
            <PreviewCard
              tone="move"
              rows={[
                ['จาก', fromPond.name],
                ['ไป', toPond?.name ?? '—'],
                ['หลังย้าย (ต้นทาง)', `${fmt.num(after.from)} ตัว`],
                ['หลังย้าย (ปลายทาง)', `${fmt.num(after.to)} ตัว`],
              ]}
              totalLabel="จำนวนย้าย"
              total={`${fmt.num(parseInt(amount || '0', 10))} ตัว`}
            />
          </ScrollView>
          <BottomBar>
            <Row gap={8}>
              <Btn
                tone="move"
                variant="ghost"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => setStep(1)}
              >
                แก้ไข
              </Btn>
              <Btn
                tone="move"
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
