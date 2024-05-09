const { Stack, Duration } = require('aws-cdk-lib');
const { WebAssemblyBuildProject, DocumentationBuildProject, PackageBuildProject, PublishProject } = require('./buildProjects');
const iam = require('aws-cdk-lib/aws-iam');
const s3 = require('aws-cdk-lib/aws-s3');
// const { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } = require('aws-cdk-lib/pipelines');
const codepipeline = require('aws-cdk-lib/aws-codepipeline');
const codepipeline_actions = require('aws-cdk-lib/aws-codepipeline-actions');
const codebuild = require('aws-cdk-lib').aws_codebuild;
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
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeArtifactAdminAccess'),
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

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['codeartifact:*'],
      resources: ['*'],
      effect: iam.Effect.ALLOW
    }));

    const wasmArtifactBucket = new s3.Bucket(this, 'TamsinWasmArtifactBucket', {
      bucketName: 'tamsin-artifact-bucket',
      // publicReadAccess: true,  // Adjust this according to your needs
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0
      }
    });

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'TamsinWptestPipeline'
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
      output: sourceOutput,
      branch: 'main', // Optional: default is 'master'
      // trigger: codepipeline_actions.GitHubTrigger.WEBHOOK // Optional: default is webhook
    }));

    const webAssemblyBuildProject = new WebAssemblyBuildProject(this, pipelineRole, wasmArtifactBucket);
    const documentationBuildProject = new DocumentationBuildProject(this, pipelineRole, wasmArtifactBucket);
    const buildWasmStage = pipeline.addStage({
      stageName: 'BuildWasmAndDoc'
    });
    const wasmOutput = new codepipeline.Artifact('wasmArtifact');
    const docOutput = new codepipeline.Artifact('docArtifact');
    buildWasmStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildWasmAction',
      project: webAssemblyBuildProject,
      input: sourceOutput, // This assumes you have a source stage outputting an artifact
      outputs: [wasmOutput]
    }));
    buildWasmStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildDocAction',
      project: documentationBuildProject,
      input: sourceOutput, // This assumes you have a source stage outputting an artifact
      outputs: [docOutput]
    }));

    const packageProject = new PackageBuildProject(this, pipelineRole, wasmArtifactBucket);
    const buildPackageStage = pipeline.addStage({
      stageName: 'BuildPackage'
    });
    const packageOutput = new codepipeline.Artifact();
    buildPackageStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildPackageAction',
      project: packageProject,
      input: wasmOutput, // This assumes you have a source stage outputting an artifact
      extraInputs: [docOutput],
      outputs: [packageOutput]
    }));

    const publishProject = new PublishProject(this, pipelineRole, wasmArtifactBucket);
    const publishStage = pipeline.addStage({
      stageName: 'PublishPackage'
    });
    const publishOutput = new codepipeline.Artifact();
    publishStage.addAction(new codepipeline_actions.CodeBuildAction({
      actionName: 'PublishAction',
      project: publishProject,
      input: packageOutput, // This assumes you have a source stage outputting an artifact
      outputs: [publishOutput]
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
