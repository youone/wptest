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
                name: 'wasmOutput',
                packageZip: false
            }),
        });
    }
}

class DocumentationBuildProject extends codebuild.Project {
    constructor(scope, pipelineRole, wasmArtifactBucket) {
        super(scope, 'wptestDocBuild', {
            role: pipelineRole,
            source: codebuild.Source.gitHub({
                owner: 'youone',
                repo: 'wptest',
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.fromCodeBuildImageId('aws/codebuild/standard:7.0'),
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'docker run --rm -v $(pwd)/doc:/documents asciidoctor/docker-asciidoctor asciidoctor -o index.html documentation.adoc',
                            // 'printf "\n\033[0;32mreplacing https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9\nwith ${MATHJAX_URL}\033[0m \n"',
                            // 'sed -i "s@https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9@${MATHJAX_URL}@g" doc/index.html',
                            'ls -al doc/',
                            // 'mv doc/index.html ./index.html',
                        ],
                    },
                },
                artifacts: {
                    files: [
                        'doc/**/*'
                      ],
                },
            }),
            artifacts: codebuild.Artifacts.s3({
                bucket: wasmArtifactBucket,
                name: 'docOutput',
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
                            'rm -rf doc',
                            'cp -r ../01/doc ./doc',
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
                            `aws codeartifact login --tool npm --domain dspdf --domain-owner ${cdk.Aws.ACCOUNT_ID} --repository dspdf-npm-repo`,
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
    DocumentationBuildProject,
    PackageBuildProject,
    PublishProject
};