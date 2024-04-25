import { loadWasm } from "../.";

let myWasmClass;
loadWasm({conf1: 1}).then(async mwc => {
    myWasmClass = mwc;
    document.getElementById('buildinfo').innerHTML =  myWasmClass.getCommitHash();
})

const url = new URL(location.href);
url.protocol = 'ws';

const wsBaseUrl = url.href + 'websocket/';

const ws1 = new WebSocket(`${wsBaseUrl}foo?var=1`);
ws1.onopen = (event) => {
    ws1.send('from ws1');
}
ws1.onmessage = (message) => {
    console.log('message on foo:', message.data);
}

const ws2 = new WebSocket(`${wsBaseUrl}bar?var=2`);
ws2.onopen = (event) => {
    ws2.send('from ws2');
}
ws2.onmessage = (message) => {
    console.log('message on bar:', message.data);
}

document.getElementById('dobutton').addEventListener('click', async (event) => {

    const result = await myWasmClass.method1([1,2,3]);
    console.log('result: ', result);

    // GET
    fetch(`api/v1/resource/location?var1=1&var2=2`)
    .then(response => response.text())
    .then(text => console.log(text));

    // POST
    fetch(`api/v1/resource`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({key: 'value'})
    })
    .then(response => response.text())
    .then(text => console.log(text));

    // GET
    fetch(`jsontest/key/value/one/two`)
    .then(response => response.text())
    .then(text => console.log(text));
    
    const wsDynamic1 = new WebSocket(`${wsBaseUrl}new/askjhas67as76d7?var=26513`);
    wsDynamic1.onopen = (event) => {
        wsDynamic1.send('from wsDynamic1');
    }
    wsDynamic1.onmessage = (message) => {
       console.log('message on wsDynamic1:', message.data);
    }

    const wsDynamic2 = new WebSocket(`${wsBaseUrl}new/98234671guqwdkijgw?var=66666`);
    wsDynamic2.onopen = (event) => {
        wsDynamic2.send('from wsDynamic2');
    }
    wsDynamic2.onmessage = (message) => {
        console.log('message on wsDynamic2:', message.data);
     }
})