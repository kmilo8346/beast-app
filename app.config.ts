import dotenv from 'dotenv-safe';
import { ExpoConfig, ConfigContext } from '@expo/config';
import os from 'os';
import path from 'path';

// to use another environmet export ENV_PATH
// development: export ENV_PATH=.env.development
// staging: export ENV_PATH=.env.staging
// production: export ENV_PATH=.env.production
// local: unset ENV_PATH
const envContent = dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), '.env'),
}).parsed;

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
