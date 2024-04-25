#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('CREATING ENVIRONMENT FILE');

let envFile = '';
Object.entries({...process.env, ...{
    DSPDF_CI_COMMIT_SHORT_SHA: 'abcd1234', 
    DSPDF_CI_PROJECT_ID: process.env.DSPDF_CI_PROJECT_ID_WPTEST,
    DSPDF_CI_REGISTRY_IMAGE: process.env.DSPDF_IMAGE_ARTIFACT_PATH + '/wptest'
}}).filter(([name, value]) => name.startsWith('DSPDF_')).forEach(([name, value]) => {
    envFile += `${name.split('DSPDF_')[1]}=${value}\n`
})

console.log(envFile);

fs.writeFileSync(path.resolve(__dirname, 'env.txt'), envFile);
    
