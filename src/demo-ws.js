const url = new URL(location.href);
url.protocol = 'ws';

const wsBaseUrl = url.href.split('demo-ws.html')[0] + 'websocket/';

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

document.getElementById('dobutton').addEventListener('click', (event) => {

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