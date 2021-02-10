// cache
import PersistedCache from './persisted-cache';

export interface GenericData {
  onboarding: boolean;
}

class GenericCache extends PersistedCache<GenericData> {
  getOnboarding() {
    const data = this.getData();
    return data?.onboarding;
  }
}

export default new GenericCache('generic');
