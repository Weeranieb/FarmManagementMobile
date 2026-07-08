import { View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { CELL_W, GROUP_LIGHT, NAME_W, PELLET_CELL_W } from '../constants';

function GroupBand({
  w,
  title,
  unit,
  ink,
}: {
  w: number;
  title: string;
  unit: string;
  ink: string;
}) {
  return (
    <View
      style={{
        width: w,
        paddingHorizontal: 10,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderBottomWidth: 2,
        borderBottomColor: ink,
      }}
    >
      <Text
        style={{
          fontSize: 12.5,
          fontFamily: type.familyBold,
          color: ink,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 10.5,
          opacity: 0.55,
          fontFamily: type.familySemi,
          color: ink,
          marginLeft: 'auto',
        }}
      >
        {unit}
      </Text>
    </View>
  );
}

function LeafCell({ w, label }: { w: number; label: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        width: w,
        backgroundColor: t.surface,
        paddingHorizontal: 0,
        paddingRight: 10,
        paddingBottom: 4,
        paddingTop: 2,
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 11.5,
          fontFamily: type.familySemi,
          color: t.inkSoft,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function TableHeader() {
  const { t } = useTheme();

  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderBottomWidth: 1,
        borderBottomColor: t.borderStrong,
      }}
    >
      {/* Group row */}
      <View style={{ flexDirection: 'row', height: 30 }}>
        <View
          style={{
            width: NAME_W,
            backgroundColor: t.surface,
            paddingHorizontal: 10,
            paddingBottom: 6,
            justifyContent: 'flex-end',
            borderRightWidth: 1,
            borderRightColor: t.borderStrong,
          }}
        >
          <Text
            style={{
              fontSize: 10.5,
              fontFamily: type.familyBold,
              color: t.inkMute,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            บ่อ
          </Text>
        </View>
        <GroupBand w={PELLET_CELL_W * 2} {...GROUP_LIGHT.pellet} />
        <GroupBand w={CELL_W} {...GROUP_LIGHT.fresh} />
        <GroupBand w={CELL_W} {...GROUP_LIGHT.death} />
        <GroupBand w={CELL_W} {...GROUP_LIGHT.catch} />
      </View>
      {/* Leaf row */}
      <View style={{ flexDirection: 'row', height: 24 }}>
        <View
          style={{
            width: NAME_W,
            backgroundColor: t.surface,
            borderRightWidth: 1,
            borderRightColor: t.borderStrong,
          }}
        />
        <LeafCell w={PELLET_CELL_W} label="เช้า" />
        <LeafCell w={PELLET_CELL_W} label="เย็น" />
        <LeafCell w={CELL_W} label="" />
        <LeafCell w={CELL_W} label="ตัว" />
        <LeafCell w={CELL_W} label="ตัว" />
      </View>
    </View>
  );
}
