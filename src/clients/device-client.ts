import RestClient from './rest-client';
import { CreateDevice, Device } from '../types';

class DeviceClient extends RestClient<Device, CreateDevice> {}

export default new DeviceClient('/devices');
