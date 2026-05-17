import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Card, Pill, TopBar } from '@/components/ui';
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
        fontSize: 12,
        fontFamily: type.familyBold,
        color: t.inkSoft,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 8,
      }}
    >
      {children}
    </Text>
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
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: t.inkSoft,
              fontSize: 14,
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
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <SectionLabel>{tx('manage.toolsLabel')}</SectionLabel>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Card padded={false}>
            <ListRow
              icon="feed"
              label={tx('manage.rowFeedCollection')}
              sub={feedSub}
              onPress={openFeedCollection}
            />
            <ListRow
              icon="merchant"
              label={tx('manage.rowMerchants')}
              sub={tx('manage.comingSoon')}
              disabled
              trailing={<Pill tone="ghost">{tx('manage.comingSoon')}</Pill>}
            />
            <ListRow
              icon="worker"
              label={tx('manage.rowWorkers')}
              sub={tx('manage.comingSoon')}
              disabled
              trailing={<Pill tone="ghost">{tx('manage.comingSoon')}</Pill>}
              last
            />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12 }}>
          <Text
            style={{
              fontSize: 11,
              color: t.inkMute,
              lineHeight: 18,
              letterSpacing: 0.1,
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
