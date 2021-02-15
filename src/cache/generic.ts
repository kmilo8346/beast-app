// cache
import PersistedCache from './persisted-cache';

export interface GenericData {
  onboarding: boolean;
  device_id: string;
}

class GenericCache extends PersistedCache<GenericData> {
  getOnboarding() {
    const data = this.getData();
    return data?.onboarding;
  }

  getDeviceId() {
    const data = this.getData();
    return data?.device_id;
  }
}

export default new GenericCache('generic');
