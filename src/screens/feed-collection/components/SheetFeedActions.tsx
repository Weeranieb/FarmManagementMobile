import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { dangerInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { SheetShell } from '@/screens/account-info/components/SheetShell';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { FEED_ORANGE, FEED_TYPE_LABEL_TH } from '../feedPalette';
import { FeedChartIcon, FeedPackageIcon } from './FeedIcons';

type Props = {
  visible: boolean;
  feed: FeedCollectionModel | null;
  onClose: () => void;
  onEdit: () => void;
  onUpdatePrice: () => void;
  onDelete?: () => void;
};

export function SheetFeedActions({
  visible,
  feed,
  onClose,
  onEdit,
  onUpdatePrice,
  onDelete,
}: Props) {
  const { t, mode } = useTheme();
  const danger = dangerInk(mode, t);

  if (!feed) {
    return (
      <SheetShell visible={visible} onClose={onClose} heightPct={0.42}>
        {null}
      </SheetShell>
    );
  }

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.5}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}>
        <Row gap={12} style={{ marginBottom: 14 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              backgroundColor: FEED_ORANGE.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FeedPackageIcon size={20} stroke={2} color="#fff" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 15, fontFamily: type.familyBold, color: t.ink }}
            >
              {feed.name}
            </Text>
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.familyNum, marginTop: 2 }}>
              {feed.price != null ? `${fmt.baht(feed.price)}/${feed.unit} · ` : ''}
              {FEED_TYPE_LABEL_TH[feed.kind]}
            </Text>
          </View>
        </Row>

        <ActionRow
          icon={<Icon.edit size={18} color={t.inkSoft} />}
          label="แก้ไขรายละเอียด"
          sub="ชื่อ · ประเภท · FCR"
          onPress={onEdit}
        />
        <ActionRow
          icon={<FeedChartIcon size={18} color={FEED_ORANGE.ink} />}
          iconBg="#ffffff"
          label="อัปเดตราคา"
          sub="บันทึกราคาใหม่ในประวัติ"
          highlight
          onPress={onUpdatePrice}
        />
        <ActionRow
          icon={<Icon.trash size={18} color={danger} />}
          iconBg={t.dangerSoft}
          label="ลบรายการ"
          sub="ใช้กับการบันทึกในอนาคตเท่านั้น"
          labelColor={danger}
          onPress={onDelete}
        />
      </View>
    </SheetShell>
  );
}

function ActionRow({
  icon,
  iconBg,
  label,
  sub,
  highlight,
  labelColor,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  sub: string;
  highlight?: boolean;
  labelColor?: string;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: highlight ? FEED_ORANGE.soft : 'transparent',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: iconBg ?? t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontFamily: type.familySemi, color: labelColor ?? t.ink }}>
          {label}
        </Text>
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <Icon.chevR size={16} color={t.inkSoft} />
    </Pressable>
  );
}
