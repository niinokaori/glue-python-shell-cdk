import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/types/types';

interface GlueSampleJobProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class GlueSampleJobStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GlueSampleJobProps) {
    super(scope, id, props);
    
    const { config } = props;
    const accountID = cdk.Stack.of(this).account;

    // 新規S3バケットを作成
    const scriptBucket = new s3.Bucket(this, 'ScriptBucket', {
      bucketName: `${config.glueJob.scriptBucketName}-${accountID}-${config.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Glue Job用のIAMロールを作成
    const glueJobRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')
      ],
    });

    // S3バケットへのアクセス権限を追加
    glueJobRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:ListBucket'
      ],
      resources: [
        scriptBucket.bucketArn,
        `${scriptBucket.bucketArn}/*`
      ]
    }));

    // Glue JobのスクリプトファイルをS3バケットにアップロード
    new s3deploy.BucketDeployment(this, 'DeployGlueScript', {
      sources: [s3deploy.Source.asset('./script')],
      destinationBucket: scriptBucket,
      destinationKeyPrefix: 'scripts',
      prune: false
    });

    // Glue Job作成
    const glueJob = new glue.CfnJob(this, 'GlueSampleJob', {
      name: config.glueJob.jobName,
      role: glueJobRole.roleArn,
      command: {
        name: 'pythonshell',
        pythonVersion: config.glueJob.pythonVersion,
        scriptLocation: `s3://${scriptBucket.bucketName}/scripts/sample.py`
      },
      executionProperty: {
        maxConcurrentRuns: config.glueJob.maxConcurrentRuns,
      },
      defaultArguments: {
        "--TempDir": `s3://${scriptBucket.bucketName}/tmp`,
        "--job-language": "python",
      },
      glueVersion: '3.0',
      maxRetries: 0,
      timeout: 2880, 
    });

    // EventBridge Scheduler用のIAMロールを作成
    const schedulerRole = new iam.Role(this, 'SchedulerGlueJobRole', {
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
      inlinePolicies: {
        'GlueJobStartPolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['glue:StartJobRun'],
              resources: [`arn:aws:glue:${this.region}:${this.account}:job/${config.glueJob.jobName}`],
            }),
          ],
        }),
      },
    });

    // EventBridge Scheduler の作成
    const schedule = new scheduler.CfnSchedule(this, 'GlueJobSchedule', {
      name: config.scheduler.scheduleName,
      scheduleExpression: config.scheduler.scheduleExpression,
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      target: {
        arn: 'arn:aws:scheduler:::aws-sdk:glue:startJobRun',
        roleArn: schedulerRole.roleArn,
        input: JSON.stringify({
          JobName: config.glueJob.jobName,
        }),
      },
    });

    // Scheduler が Glue Job 作成後に作成されるように依存関係を設定
    schedule.addDependency(glueJob);

    // CloudFormationの出力を追加
    new cdk.CfnOutput(this, 'GlueJobName', {
      value: config.glueJob.jobName,
    });

    new cdk.CfnOutput(this, 'ScriptBucketName', {
      value: scriptBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'SchedulerName', {
      value: config.scheduler.scheduleName,
    });
  }
}