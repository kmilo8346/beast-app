import { AsyncStorage } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// clients
import deviceClient from '../clients/device-client';
// libs
import { capture } from './sentry';
// types
import { CreateDevice, Device } from '../types';

const prefix = '[device agent]';

class DeviceAgent {
  private current: Device | null = null;

  private token: string | null = null;

  private async getCurrent() {
    if (!this.current) {
      const raw = await AsyncStorage.getItem('@global/device');
      if (raw) {
        this.current = JSON.parse(raw);
      }
    }
    return this.current;
  }

  private async getToken() {
    if (!this.token) {
      if (!Constants.isDevice) {
        this.token = null;
      } else {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        this.token = token || null;
      }
    }
    return this.token;
  }

  private async save(device: Device) {
    await AsyncStorage.setItem('@global/device', JSON.stringify(device));
  }

  public async sync(update: Partial<Device>): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        return;
      }
      const current = await this.getCurrent();
      let device = { ...current, token, ...update };

      let created: Device | null = null;
      if (!device.id) {
        created = await deviceClient.create({
          body: device as CreateDevice,
        });
      } else {
        try {
          await deviceClient.update({
            pathVars: { id: device.id },
            body: device,
          });
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error;
          }

          created = await deviceClient.create({
            body: device as CreateDevice,
          });
        }
      }

      // update device
      device = { ...device, ...created };

      await this.save(device as Device);
    } catch (error) {
      capture(prefix, 'Sync error', error);
    }
  }
}

export default new DeviceAgent();
