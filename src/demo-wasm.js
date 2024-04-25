import moduleGenerator from '../lib/wasm-module';
import Worker from 'worker-loader!./worker1.worker';

const w1 = Worker();
const w2 = Worker();

// const buffMemLength = new SharedArrayBuffer(1024); //byte length
// let typedArr = new Float64Array(buffMemLength);

let typedArr = new Float64Array(1024);

typedArr[0] = 20;

document.getElementById('dobutton').addEventListener('click', event => {
    w1.postMessage(typedArr);
    w2.postMessage(typedArr);
    setTimeout(() => {
        console.log(typedArr[0]);
    }, 1000)
})

moduleGenerator().then(async wasmModule => {
    wasmModule;
    const myClass = new wasmModule.MyClass(0);
})