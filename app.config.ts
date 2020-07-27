import dotenv from 'dotenv-safe';
import { ExpoConfig, ConfigContext } from '@expo/config';
import os from 'os';

const options: dotenv.DotenvSafeOptions = {};
// uncomment to test other environments,
// comment when finish `(o.o)´

// options.path = '.env.development';
// options.path = '.env.staging';
// options.path = '.env.production';
const envContent = dotenv.config(options).parsed;

const getIp = () => {
  const interfaces = os.networkInterfaces();

  const devNames = Object.keys(interfaces);
  for (let i = 0; i < devNames.length; i++) {
    const iface = interfaces[devNames[i]];
    if (iface) {
      for (let i = 0; i < iface.length; i += 1) {
        const alias = iface[i];
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal
        )
          return alias.address;
      }
    }
  }

  return '0.0.0.0';
};

if (envContent?.BEAST_API_URL.includes('[IP]')) {
  envContent.BEAST_API_URL = envContent.BEAST_API_URL.replace('[IP]', getIp());
}

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    extra: envContent || {},
  } as ExpoConfig;
};
