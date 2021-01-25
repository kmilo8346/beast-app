// cache
import PersistedCache from '../../../cache/persisted-cache';

// instances outside

class RecentSearchesCache extends PersistedCache<{ searches: string[] }> {
  getSearches(): string[] {
    return this.getData()?.searches || [];
  }

  add(search: string) {
    const safe = search.toLowerCase().trim();
    this.setData({
      searches: [
        safe,
        ...this.getSearches()
          .filter((s) => s.toLowerCase().trim() !== safe)
          .slice(0, 9),
      ],
    });
  }

  delete(search: string) {
    const safe = search.toLowerCase().trim();
    this.setData({
      searches: [
        ...this.getSearches().filter((s) => s.toLowerCase().trim() !== safe),
      ],
    });
  }
}

export default new RecentSearchesCache('recent-searches');
