#!/usr/bin/env node

const {NativeClass, loadWasm} = require("..");

// (async()=>{
//   let myWasmClass;

//   let test1 = false;
//   let test2 = false;

//   mwc = await loadWasm({conf1: 1});
//   myWasmClass = mwc;
//   const commitHash = myWasmClass.getCommitHash();

//   console.log('WASM COMMIT HASH: ', commitHash);
  
//   if (1 == 1)  {
//     console.log("test 1 SUCCESS!");
//     test1 = true;
//   }
//   else {
//     console.log("test 1 FAIL!");
//     test1 = false;
//   };

//   const nc = new NativeClass(0);
//   const result2 = nc.doStuff({
//       array1: [[0,1,1,0,0,0], [0,1,1,0,0,0], [0,1,1,0,0,0]],
//       array2: [[1.0,2.0,3.0], [1.0,2.0,3.0], [1.0,2.0,3.0], [1.0,2.0,3.0]]
//   });

//   if (result2[0] + result2[1] + result2[2] === 6)  {
//     console.log("test 2 SUCCESS!");
//     test2 = true;
//   }
//   else {
//     console.log("test 2 FAIL!");
//     test2 = false;
//   };

//   process.exit((test1 && test2) ? 0 : 1);

// })()

const jest = require("jest");
const path = require("path");

const options = {
  projects: [path.resolve(__dirname)],
  silent: true,
};

jest
  .runCLI(options, options.projects)
  .then((success) => {
    console.log(success.results.success ? 'PASSED!' : 'FAILED!');
    process.exit(success.results.success ? 0 : 1)
  })
  .catch((failure) => {
    console.error('COULD NOT RUN TESTS!');
    process.exit(1)
  });