import { devConfig } from './dev/dev';
// import { prodConfig } from './prod';  //本番用パラメータを作成した際は有効化する
import { EnvironmentConfig } from './types/types';

export function getConfig(environment: string): EnvironmentConfig {
  switch (environment) {
    case 'dev':
      return devConfig;
    // case 'prod':
    //   return prodConfig;
    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
}

export type { EnvironmentConfig };