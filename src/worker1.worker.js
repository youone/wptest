import moduleGenerator from '../lib/wasm-module';

function emArray(array) {
    const ptr = wasmModule._malloc(array.length*64);
    (new Float64Array(wasmModule.HEAPU8.buffer, ptr, array.length)).set(array);
    return ptr;
}

let wasmModule, MyClass, myClass;
moduleGenerator().then(async wm => {
    wasmModule = wm;
    MyClass = wasmModule.MyClass;
    myClass = new MyClass(0);
})

console.log('worker 1 loaded');

self.onmessage = (message) => {
    let arr = new Float64Array(message.data);
    console.log('Data received from the main thread: %f', arr[0]);
    arr[0] = 40;
    console.log(message);
    MyClass.logBuildTime();
}
