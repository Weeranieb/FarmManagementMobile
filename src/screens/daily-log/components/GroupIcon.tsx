import {
  FeedFishIcon,
  FeedPelletIcon,
} from '@/screens/feed-collection/components/FeedIcons';
import type { GroupKey } from '../constants';

type Props = {
  group: GroupKey;
  size?: number;
  color: string;
};

/**
 * Per-group glyph for the numpad header tile and the feed-type picker title.
 * Pellet uses the same 4-pellet cluster as the feed-collection screen;
 * everything else uses the same fish silhouette — same lucide-flavored
 * stroke / sizing — so the two screens read as one system.
 */
export function GroupIcon({ group, size = 14, color }: Props) {
  if (group === 'pellet') return <FeedPelletIcon size={size} color={color} />;
  return <FeedFishIcon size={size} color={color} />;
}
