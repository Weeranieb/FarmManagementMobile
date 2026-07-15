import { useCallback, useState } from 'react';

/** Shared search-bar open/query state used by list screens. */
export function useSearchQuery() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const onOpenSearch = useCallback(() => setSearchOpen(true), []);
  const onCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
  }, []);
  const onChangeQuery = useCallback((s: string) => setQuery(s), []);

  return { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery };
}
