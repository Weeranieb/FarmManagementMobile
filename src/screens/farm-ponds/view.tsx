import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import type { PondModel } from '@/features/pond';
import { PondRowCard } from './components/PondRowCard';

type Props = {
  farmTitle: string;
  ponds: PondModel[];
  showHeader?: boolean;
  onBack?: () => void;
  onOpenPond: (pondId: number) => void;
};

export function FarmPondsView({ farmTitle, ponds, showHeader = true, onBack, onOpenPond }: Props) {
  const { t } = useTheme();
  const countLabel = `${ponds.length} บ่อ`;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={farmTitle}
          subtitle={countLabel}
          leading={
            onBack ? (
              <Pressable
                onPress={onBack}
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
                <Icon.back size={18} color={t.ink} />
              </Pressable>
            ) : null
          }
        />
      ) : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View
            style={{
              height: 48,
              borderRadius: radii.md,
              backgroundColor: t.surfaceAlt,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Icon.search size={18} color={t.inkSoft} />
            <Text style={{ color: t.inkMute, fontSize: 14, fontFamily: type.family }}>
              ค้นหาบ่อ
            </Text>
          </View>
        </View>

        <Col gap={12} style={{ paddingHorizontal: 20 }}>
          {ponds.length === 0 ? (
            <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
              ยังไม่มีบ่อในฟาร์มนี้
            </Text>
          ) : (
            ponds.map((p) => <PondRowCard key={p.id} pond={p} onPress={() => onOpenPond(p.id)} />)
          )}
        </Col>
      </ScrollView>
    </View>
  );
}
