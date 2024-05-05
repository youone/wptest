const { Stack, Duration } = require('aws-cdk-lib');
const { WebAssemblyBuildProject } = require('./WebAssemblyBuildProject');
const iam = require('aws-cdk-lib/aws-iam');
const s3 = require('aws-cdk-lib/aws-s3');
// const { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } = require('aws-cdk-lib/pipelines');
const codepipeline = require('aws-cdk-lib/aws-codepipeline');
const codepipeline_actions = require('aws-cdk-lib/aws-codepipeline-actions');
const  codebuild = require('aws-cdk-lib').aws_codebuild;
const cdk = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');

class WptestPipelinekStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // The code that defines your stack goes here

    const pipelineRole = new iam.Role(this, 'TamsinWasmPipelineRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMPatchAssociation'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeBuildAdminAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess'),
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: ['*'], 
      effect: iam.Effect.ALLOW
    }));

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['iam:*'],
      resources: ['*'], 
      effect: iam.Effect.ALLOW
    }));

    const wasmArtifactBucket = new s3.Bucket(this, 'TamsinWasmArtifactBucket', {
      bucketName: 'tamsin-artifact-bucket',
      // publicReadAccess: true,  // Adjust this according to your needs
      removalPolicy: cdk.RemovalPolicy.DESTROY
      });

    const webAssemblyProject = new WebAssemblyBuildProject(this, pipelineRole, wasmArtifactBucket);

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0
      }
    });

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'DemoPipeline3'
    });

   // Create an output artifact
   const sourceOutput = new codepipeline.Artifact();

   // Add a source stage to the pipeline
   const sourceStage = pipeline.addStage({
     stageName: 'Source'
   });

   sourceStage.addAction(new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub_Source',
      owner: 'youone',
      repo: 'wptest',
      connectionArn: 'arn:aws:codestar-connections:eu-north-1:007911779249:connection/a9c38cf4-fdaf-481b-8f87-fdad88c0895d',
      // oauthToken: cdk.SecretValue.secretsManager('github-oauth-token'),
      output:sourceOutput,
      branch: 'main', // Optional: default is 'master'
      // trigger: codepipeline_actions.GitHubTrigger.WEBHOOK // Optional: default is webhook
   }));

    const buildStage = pipeline.addStage({
      stageName: 'Build'
    });

   // Create an output artifact
   const wasmOutput1 = new codepipeline.Artifact();
   const wasmOutput2 = new codepipeline.Artifact();

    buildStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild1',
      project: webAssemblyProject,
      input: sourceOutput, // This assumes you have a source stage outputting an artifact
      outputs: [wasmOutput1]
    }));

    buildStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild2',
      project: webAssemblyProject,
      input: sourceOutput, // This assumes you have a source stage outputting an artifact
      outputs: [wasmOutput2]
    }));

//     // const sourceOutput = new codepipeline.Artifact();
//     const wasmOutput = new codepipeline.Artifact();

//     const wasmBuildAction = new codepipeline_actions.CodeBuildAction({
//       actionName: 'CompileWebAssembly',
//       project: webAssemblyProject,
//       // input: sourceOutput,
//       outputs: [wasmOutput],
//   });

//   const wptestPipeline = new codepipeline.Pipeline(this, 'TamsinWptestPipelinr');
//   const wasmStage = wptestPipeline.addStage({ stageName: 'BuildWasm', actions: [wasmBuildAction]});

//   //   , {
// //     pipelineName: 'TamsinWptestPipelinr',
// //     stages: [
// //         {
// //             stageName: 'CompileWebAssembly',
// //             actions: [wasmBuildAction],
// //         },
// //         // {
// //         //     stageName: 'WebpackBuild',
// //         //     actions: [webpackBuildAction],
// //         // },
// //     ],
// // });
  }
}

module.exports = { WptestPipelinekStack }
