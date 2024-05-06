const cdk = require('aws-cdk-lib');
const codebuild = require('aws-cdk-lib').aws_codebuild;
// const Construct = require('constructs').Construct;

class WebAssemblyBuildProject extends codebuild.Project {
    constructor(scope, pipelineRole, wasmArtifactBucket) {
        super(scope, 'wptestWasmBuild', {
            role: pipelineRole,
            source: codebuild.Source.gitHub({
                owner: 'youone',
                repo: 'wptest',
                // webhook: true,  // enables webhook to rebuild the source changes
                // webhookFilters: [
                //     codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main')
                // ]
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.fromDockerRegistry('emscripten/emsdk:2.0.34'),
                // privileged: true,  // Necessary if you're doing Docker operations inside CodeBuild
            },
            // buildSpec: codebuild.BuildSpec.fromSourceFilename('.aws/buildspecs/buildspec-wasm.yml'),  // Use an external buildspec file
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'bash -c "source .scripts/cicd/jobs-aws.sh; build-wasm"',
                            'ls -al lib/'
                        ],
                    },
                },
                artifacts: {
                    files: [
                        '**/*'
                      ],
                },
            }),
            artifacts: codebuild.Artifacts.s3({
                bucket: wasmArtifactBucket,
                packageZip: false
            }),
        });
    }
}

class PackageBuildProject extends codebuild.Project {
    constructor(scope, pipelineRole, wasmArtifactBucket) {
        super(scope, 'wptestPackageBuild', {
            role: pipelineRole,
            source: codebuild.Source.gitHub({
                owner: 'youone',
                repo: 'wptest',
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.fromDockerRegistry('node:18.17.1'),
                environmentVariables: {
                    'NODE_HEADERS_URL': {
                        value: 'http://nodejs.org/dist/v18.17.1'
                    },
                    'CI_COMMIT_SHORT_SHA': {
                        value: 'abcd1234'
                    },
                },
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'ls -al',
                            'ls -al .scripts/',
                            'bash -c "source .scripts/cicd/jobs-aws.sh; build-package"',
                        ],
                    },
                },
                artifacts: {
                    files: [
                        'package/**/*',
                        'dockerfile',
                        '.scripts/**/*',
                      ],
                },
            }),
            artifacts: codebuild.Artifacts.s3({
                bucket: wasmArtifactBucket,
                packageZip: false
            }),
        });
    }
}

class PublishProject extends codebuild.Project {
    constructor(scope, pipelineRole, wasmArtifactBucket) {
        super(scope, 'wptestPackagePublish', {
            role: pipelineRole,
            environment: {
                buildImage: codebuild.LinuxBuildImage.fromCodeBuildImageId('aws/codebuild/standard:7.0'),
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'ls -al package',
                            'aws --version',
                            'node --version',
                            'npm --version',
                            `aws codeartifact login --tool npm --domain dfdsp --domain-owner ${cdk.Aws.ACCOUNT_ID} --repository dfdsp-npm-repo`,
                            'cat ~/.npmrc',
                            'mv package/*.tgz ./package.tgz',
                            'npm publish package.tgz',
                        ],
                    },
                },
            })
        });
    }
}


module.exports = { 
    WebAssemblyBuildProject,
    PackageBuildProject,
    PublishProject
};