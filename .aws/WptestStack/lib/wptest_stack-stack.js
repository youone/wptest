const { Stack, Duration } = require('aws-cdk-lib');
const { WebAssemblyBuildProject } = require('./WebAssemblyBuildProject');
const iam = require('aws-cdk-lib/aws-iam');
const s3 = require('aws-cdk-lib/aws-s3');
const codepipeline = require('aws-cdk-lib/aws-codepipeline');
const codepipeline_actions = require('aws-cdk-lib/aws-codepipeline-actions');
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
