export interface EnvironmentConfig {
    readonly environment: string;
    readonly region: string;
    readonly account: string; 
    readonly glueJob: {
      readonly jobName: string;
      readonly scriptBucketName: string;
      readonly pythonVersion: string;
      readonly maxConcurrentRuns: number;
    };
    readonly scheduler: {
      readonly scheduleName: string;
      readonly scheduleExpression: string;
    };
  }