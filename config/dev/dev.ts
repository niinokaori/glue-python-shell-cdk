import { EnvironmentConfig } from '../types/types';

export const devConfig: EnvironmentConfig = {
  environment: 'dev',
  region: 'ap-northeast-1',
  account: '<Enter AWS ACCOUNT ID>', 
  glueJob: {
    jobName: 'dev-sample-glue-python-shell-job',
    scriptBucketName: 'dev-glue-scripts',
    pythonVersion: '3.9',
    maxConcurrentRuns: 5
  },
  scheduler: {
    scheduleName: 'dev-glue-sample-python-scheduler',
    scheduleExpression: 'cron(0 11 * * ? *)'
  }
};