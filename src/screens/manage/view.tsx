import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { ListRow } from '@/screens/profile/components/ListRow';
import { thaiDate } from '@/locale/thaiDate';

type Props = {
  showHeader?: boolean;
  isAdmin: boolean;
  feedCount: number;
  feedLatestUpdate: Date | null;
  openFeedCollection: () => void;
};

function SectionLabel({ children }: { children: string }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: type.sizes.sm,
        fontFamily: type.familyBold,
        color: t.inkSoft,
        paddingHorizontal: space[5],
        paddingTop: space[5],
        paddingBottom: space[2],
      }}
    >
      {children}
    </Text>
  );
}

/** The one live tool — elevated to a hero card so the actionable item has
 *  real weight against the muted "coming soon" list below. */
function FeedToolCard({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  const { t } = useTheme();
  return (
    <Card onPress={onPress}>
      <Row gap={space[3]} align="center">
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: radii.md,
            backgroundColor: t.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.feed size={22} color={t.brandInk} />
        </View>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: t.ink }}>
            {label}
          </Text>
          <Text style={{ fontSize: type.sizes.sm, fontFamily: type.family, color: t.inkMute }}>
            {sub}
          </Text>
        </Col>
        <Icon.chevR size={18} color={t.inkSoft} />
      </Row>
    </Card>
  );
}

export function ManageView({
  showHeader = true,
  isAdmin,
  feedCount,
  feedLatestUpdate,
  openFeedCollection,
}: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {showHeader ? <TopBar title={tx('manage.title')} /> : null}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: space[7],
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: t.inkSoft,
              fontSize: type.sizes.base,
              lineHeight: 22,
              fontFamily: type.family,
            }}
          >
            {tx('manage.adminOnly')}
          </Text>
        </View>
      </View>
    );
  }

  const feedSub =
    feedCount > 0
      ? feedLatestUpdate
        ? tx('manage.feedSub', {
            count: feedCount,
            date: thaiDate.short(feedLatestUpdate),
          })
        : tx('manage.feedSubNoDate', { count: feedCount })
      : tx('manage.feedSubEmpty');

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar title={tx('manage.title')} subtitle={tx('manage.subtitle')} />
      ) : null}
      <ScrollView delaysContentTouches={false} contentContainerStyle={{ paddingBottom: space[10] }}>
        <SectionLabel>{tx('manage.toolsLabel')}</SectionLabel>
        <View style={{ paddingHorizontal: space[5] }}>
          <FeedToolCard
            label={tx('manage.rowFeedCollection')}
            sub={feedSub}
            onPress={openFeedCollection}
          />
        </View>

        {/* Coming-soon tools — grouped under their own header so the "เร็วๆ นี้"
            state is stated once (was previously duplicated as both the row
            subtitle and a trailing pill). */}
        <SectionLabel>{tx('manage.comingSoonLabel')}</SectionLabel>
        <View style={{ paddingHorizontal: space[5] }}>
          <Card padded={false}>
            <ListRow
              icon="merchant"
              label={tx('manage.rowMerchants')}
              sub={tx('manage.rowMerchantsSub')}
              disabled
            />
            <ListRow
              icon="worker"
              label={tx('manage.rowWorkers')}
              sub={tx('manage.rowWorkersSub')}
              disabled
              last
            />
          </Card>
        </View>

        <View style={{ paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: space[3] }}>
          <Text
            style={{
              fontSize: type.sizes.xs,
              color: t.inkMute,
              lineHeight: 18,
              fontFamily: type.family,
            }}
          >
            {tx('manage.footnote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
