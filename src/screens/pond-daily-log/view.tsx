import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Btn, Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { FeedSection } from './components/FeedSection';
import { AmountTile } from './components/AmountTile';
import type { PondDailyLogState } from './hook';

/** Horizontal inset inside the activity card (prototype ~20px). */
const CARD_PAD = space[5];

type Props = PondDailyLogState & {
  /** Extra bottom padding when embedded in an outer ScrollView (e.g. tab). */
  contentPaddingBottom?: number;
};

export function PondDailyLogView({
  refNow,
  monthDate,
  isViewingCurrentMonth,
  selectedDay,
  setSelectedDay,
  days,
  hasDataSet,
  canGoNext,
  goPrevMonth,
  goNextMonth,
  goToNextDay,
  isLoading,
  isError,
  hasToken,
  entry,
  selectedFullDate,
  freshSubtitle,
  pelletSubtitle,
  freshMorning,
  setFreshMorning,
  freshEvening,
  setFreshEvening,
  pelletMorning,
  setPelletMorning,
  pelletEvening,
  setPelletEvening,
  deaths,
  setDeaths,
  tourist,
  setTourist,
  contentPaddingBottom = 0,
}: Props) {
  const { t, mode } = useTheme();

  return (
    <View style={{ paddingBottom: contentPaddingBottom }}>
      <Row
        justify="space-between"
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}
      >
        <Pressable
          onPress={goPrevMonth}
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
          <Icon.chevL size={18} color={t.ink} />
        </Pressable>
        <Col gap={1} align="center">
          <Text style={{ fontFamily: type.familyBold, fontSize: 17, color: t.ink }}>
            {thaiDate.monthYear(monthDate)}
          </Text>
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
            เลือกวันเพื่อบันทึก
          </Text>
        </Col>
        <Pressable
          onPress={goNextMonth}
          disabled={!canGoNext}
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canGoNext ? 1 : 0.35,
          }}
        >
          <Icon.chevR size={18} color={t.ink} />
        </Pressable>
      </Row>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14 }}
      >
        <Row gap={6}>
          {days.map((d) => {
            const sel = d === selectedDay;
            const has = hasDataSet.has(d);
            const isFuture = isViewingCurrentMonth && d > refNow.getDate();
            const dt = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
            return (
              <Pressable
                key={d}
                disabled={isFuture}
                onPress={() => setSelectedDay(d)}
                style={{
                  minWidth: 46,
                  height: 64,
                  borderRadius: 12,
                  backgroundColor: sel ? t.brand : isFuture ? t.surfaceAlt : t.surface,
                  borderWidth: 1,
                  borderColor: sel ? t.brand : t.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 4,
                  gap: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: sel ? '#fff' : isFuture ? t.inkMute : t.inkSoft,
                    fontFamily: type.familyMedium,
                  }}
                >
                  {TH_WEEKDAYS_SHORT[dt.getDay()]}
                </Text>
                <Text
                  style={{
                    fontFamily: type.familyNumBold,
                    fontSize: 17,
                    color: sel ? '#fff' : isFuture ? t.inkMute : t.ink,
                  }}
                >
                  {d}
                </Text>
                {has && !sel ? (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: t.success,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Row>
      </ScrollView>

      {isError ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <Text style={{ fontSize: 13, color: t.danger, fontFamily: type.family }}>
            โหลดบันทึกรายเดือนไม่สำเร็จ
          </Text>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20 }}>
        <Card
          padded={false}
          style={{
            borderRadius: radii.xl,
            borderColor: t.border,
          }}
        >
          {isLoading && hasToken ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                กำลังโหลดบันทึก…
              </Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  paddingHorizontal: CARD_PAD,
                  paddingTop: 18,
                  paddingBottom: space[2],
                }}
              >
                <Row justify="space-between" align="center">
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      marginRight: space[3],
                      fontSize: 16,
                      fontFamily: type.familyBold,
                      color: t.ink,
                      lineHeight: 22,
                    }}
                  >
                    {thaiDate.longNoYear(selectedFullDate)}
                  </Text>
                  {entry ? (
                    <Pill tone="success">
                      <Row gap={4}>
                        <Icon.check size={11} color={t.statusActive} />
                        <Text
                          style={{
                            color: t.statusActive,
                            fontSize: 12,
                            fontFamily: type.familyMedium,
                          }}
                        >
                          บันทึกแล้ว
                        </Text>
                      </Row>
                    </Pill>
                  ) : (
                    <Pill tone="warn">
                      <Row gap={4}>
                        <Icon.clock size={11} color={warnInk(mode, t)} />
                        <Text
                          style={{
                            color: warnInk(mode, t),
                            fontSize: 12,
                            fontFamily: type.familyMedium,
                          }}
                        >
                          ยังไม่บันทึก
                        </Text>
                      </Row>
                    </Pill>
                  )}
                </Row>
              </View>
              <FeedSection
                title="เหยื่อสด"
                subtitle={freshSubtitle}
                morning={freshMorning}
                evening={freshEvening}
                onMorningChange={setFreshMorning}
                onEveningChange={setFreshEvening}
              />
              <Sep />
              <FeedSection
                title="อาหารเม็ด"
                subtitle={pelletSubtitle}
                morning={pelletMorning}
                evening={pelletEvening}
                onMorningChange={setPelletMorning}
                onEveningChange={setPelletEvening}
              />
              <Sep />
              <View
                style={{
                  paddingHorizontal: CARD_PAD,
                  paddingVertical: space[3],
                  gap: space[3],
                }}
              >
                <Row gap={10}>
                  <AmountTile label="ปลาตาย" unit="ตัว" value={deaths} onChange={setDeaths} />
                  <AmountTile
                    label="จับปลาเป็น"
                    optional
                    unit="ตัว"
                    value={tourist}
                    onChange={setTourist}
                  />
                </Row>
              </View>
            </>
          )}
        </Card>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <Row gap={8}>
          <View style={{ flex: 1 }}>
            <Btn tone="brand" size="lg" block>
              บันทึก
            </Btn>
          </View>
          <View style={{ flex: 1 }}>
            <Btn tone="brand" variant="soft" size="lg" block onPress={goToNextDay}>
              บันทึก & วันถัดไป
            </Btn>
          </View>
        </Row>
      </View>
    </View>
  );
}

function Sep() {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginHorizontal: CARD_PAD }} />;
}
