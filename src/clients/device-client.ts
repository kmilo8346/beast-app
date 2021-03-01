import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { AxiosRequestConfig } from 'axios';
import * as Notifications from 'expo-notifications';

// clients
import RestClient from './rest-client';
// cache
import userCache from '../cache/user';
// lib
import { capture } from '../lib/sentry';
// types
import { CreateDevice, Device, UpdateParams } from '../types';

const prefix = '[device client]';

export const getDeviceData = async (): Promise<CreateDevice> => {
  let token: string | null = null;
  try {
    if (Constants.isDevice) {
      const expoToken = await Notifications.getExpoPushTokenAsync();
      if (expoToken) {
        token = expoToken.data;
      }
    }
  } catch (error) {
    capture(prefix, 'Get device data error', error);
  }
  const user = userCache.getData();
  const address = userCache.getAddress();
  return {
    platform: Platform.OS,
    platform_version: `${Platform.Version}`,
    app_version: Constants.nativeAppVersion,
    app_build_version:
      Constants.nativeBuildVersion === null
        ? null
        : `${Constants.nativeBuildVersion}`,
    token,
    user_id: user?.id || null,
    user_location: address?.location || null,
    user_current_store: user?.current_store || null,
  };
};

class DeviceClient extends RestClient<Device, CreateDevice> {
  async updateOrCreate(
    params: UpdateParams<Device>,
    config?: AxiosRequestConfig
  ): Promise<Partial<Device>> {
    try {
      const updateResponse = await this.update(params, config);
      return updateResponse;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const createResponse = await this.create(
          {
            body: { ...params.body, id: params.pathVars?.id } as CreateDevice,
            source: params.source,
          },
          config
        );
        return createResponse;
      }
      throw error;
    }
  }
}

export default new DeviceClient('/devices');
