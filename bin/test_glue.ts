#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GlueSampleJobStack } from '../lib/test_glue-stack';
import { getConfig } from '../config';

const app = new cdk.App();

// envcode コンテキストから環境を取得
const envcode = app.node.tryGetContext('envcode');
if (!envcode) {
  throw new Error('Please specify environment with -c envcode=dev|stg|prod');
}

const config = getConfig(envcode);

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: config.region
};

new GlueSampleJobStack(app, `GlueSampleJobStack-${config.environment}`, {
  env,
  config,
  description: `${config.environment} stack for Glue Python Shell job`,
  tags: {
    Environment: config.environment,
    Project: 'GlueSampleJob'
  }
});

app.synth();