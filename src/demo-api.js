const restHost = 'localhost:8080'
// const restHost = 'localhost/demo'

document.getElementById('dobutton').addEventListener('click', (event) => {

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

})