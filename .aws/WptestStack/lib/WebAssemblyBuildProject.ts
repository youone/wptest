const  codebuild = require('aws-cdk-lib').aws_codebuild;
// const Construct = require('constructs').Construct;

class WebAssemblyBuildProject extends codebuild.Project {
    constructor(scope) {
        super(scope, 'wptestCodeBuild', {
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
                            'bash -c "source .scripts/cicd/jobs.sh; build-wasm"',
                        ],
                    },
                },
            }),
        });
    }
}

module.exports = { WebAssemblyBuildProject };