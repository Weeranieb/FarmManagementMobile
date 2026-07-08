import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { dangerInk, warnInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { SheetShell } from '@/screens/account-info/components/SheetShell';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '../feedPalette';
import { FeedChartIcon, feedGlyphFor } from './FeedIcons';

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
    return <SheetShell visible={visible} onClose={onClose} fitContent showClose />;
  }

  const Glyph = feedGlyphFor(feed.kind);
  const tone = FEED_PILL_TONE_BY_KIND[feed.kind];
  const tileBg = tone === 'warn' ? t.warnSoft : t.brandSoft;
  const toneInk = tone === 'warn' ? warnInk(mode, t) : t.brandInk;
  const toneSoft = tone === 'warn' ? t.warnSoft : t.brandSoft;

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent showClose>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        <Row gap={space[3]} style={{ marginBottom: space[4] }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              backgroundColor: tileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={20} stroke={2} color={toneInk} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: type.sizes.base, fontFamily: type.familyBold, color: t.ink }}>
              {feed.name}
            </Text>
            <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.familyNum, marginTop: 2 }}>
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
          icon={<FeedChartIcon size={18} color={toneInk} />}
          iconBg={t.surface}
          label="อัปเดตราคา"
          sub="บันทึกราคาใหม่ในประวัติ"
          highlightBg={toneSoft}
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
  highlightBg,
  labelColor,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  sub: string;
  highlightBg?: string;
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
        gap: space[3],
        paddingHorizontal: space[3],
        paddingVertical: space[3],
        borderRadius: radii.md,
        backgroundColor: highlightBg ?? 'transparent',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.sm,
          backgroundColor: iconBg ?? t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: labelColor ?? t.ink }}>
          {label}
        </Text>
        <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <Icon.chevR size={16} color={t.inkSoft} />
    </Pressable>
  );
}
