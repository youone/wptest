const { Stack, Duration } = require('aws-cdk-lib');
const { WebAssemblyBuildProject } = require('./WebAssemblyBuildProject.ts');
// const sqs = require('aws-cdk-lib/aws-sqs');

class WptestPipelinekStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // The code that defines your stack goes here




    new WebAssemblyBuildProject(this);

    // example resource
    // const queue = new sqs.Queue(this, 'WptestStackQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
  }
}

module.exports = { WptestPipelinekStack }
