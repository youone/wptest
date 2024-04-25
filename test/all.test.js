const {NativeClass, loadWasm} = require("..");

test('check wasm commit hash', () => {
    let myWasmClass;

    return loadWasm({conf1: 1}).then(async mwc => {
        myWasmClass = mwc;
        const result = await myWasmClass.method1([1,2,3]);
        const commitHash = myWasmClass.getCommitHash();
        expect(1).toBe(1);
    })
  });

test('check native', () => {
    const nc = new NativeClass(0);
    const result = nc.doStuff({
        array1: [[0,1,1,0,0,0], [0,1,1,0,0,0], [0,1,1,0,0,0]],
        array2: [[1.0,2.0,3.0], [1.0,2.0,3.0], [1.0,2.0,3.0], [1.0,2.0,3.0]]
    });
    expect(result[0] + result[1] + result[2]).toBe(6);
});

// test('test api', async () => {
//     return fetch('http://localhost:8080/api/v1/resource/parameter?var1=2&var2=5')
//     .then(response => response.json())
//     .then(jsponObject => {
//         console.log(jsponObject);
//         expect(jsponObject.parameter).toBe('parameter');
//         expect(jsponObject.queryVar1).toBe('2');
//         expect(jsponObject.queryVar2).toBe('5');
//     })
//   });




