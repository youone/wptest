#!/usr/bin/env node

const log4js = require("log4js");

function server(config, silent) {

    const express = require('express')
    const WSServer = require('ws').Server;
    const path = require('path')
    const cors = require('cors')
    const app = express()
    const {NativeClass} = require(".");

    const logger = log4js.getLogger();
    logger.level = silent ? 'fatal' : 'debug';

    let resolver, rejecter;

    app.use(express.json())
    app.use(cors());
    app.options('*', cors());

    // //allowing for use of sharedArrayBuffers
    // app.use((req, res, next) => {
    //     res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); 
    //     // res.setHeader("Cross-Origin-Embedder-Policy", "same-origin"); 
    //     next();
    // })

    //******************************
    //     serve static content
    //******************************

    app.use(express.static(path.resolve(__dirname, 'dist')));
    // app.use('/doc/mathjax', express.static(path.resolve(__dirname, 'lib/mathjax')));
    app.use('/doc', express.static(path.resolve(__dirname, 'doc')));

    //******************************
    //          REST
    //******************************

    app.get('/api/v1/resource/:parameter', (req, res, next) => {
        reqURL = new URL(req.url, 'http://' + req.headers.host + '/');

        const nc = new NativeClass(0);

        res.json({
            parameter: req.params.parameter,
            queryVar1: reqURL.searchParams.get('var1'),
            queryVar2: reqURL.searchParams.get('var2'),
            native: nc.doStuff({
                array1: [[0,1,1,0,0,0], [0,1,1,0,0,0], [0,1,1,0,0,0]],
                array2: [[1.0,2.0,3.0], [1.0,2.0,3.0], [1.0,2.0,3.0]]
            })
        })
    })

    app.post('/api/v1/resource', (req, res, next) => {
        res.json({requestBody: req.body});
    })

    //******************************
    //          proxy
    //******************************

    const { createProxyMiddleware } = require('http-proxy-middleware');

    app.use('/jsontest',
        createProxyMiddleware({
        target: 'http://echo.jsontest.com/',
        changeOrigin: true,
        pathRewrite: {
            '^/jsontest':''
        }
        }),
    );

    //*********************************************************************
    //     set up web sockets (all on the same port as the http server)
    //*********************************************************************

    const server = require('http').createServer();

    const wss1 = new WSServer({ noServer: true });
    const wss2 = new WSServer({ noServer: true });

    wss1.on('connection', (req, ws) => {
        ws.send('welcome on foo');
        ws.on('message', (message) => {
            logger.info('message on ws1:', message + '');
        });
    });

    wss2.on('connection', (req, ws) => {
        ws.send('welcome on bar');
        ws.on('message', (message) => {
            logger.info('message on ws2:', message + '');
        });
    });

    server.on('upgrade', (request, socket, head) => {
        const pathname = new URL(request.url, 'http://' + request.headers.host + '/').pathname;

        // dynamic web socket server creation  
        if (pathname.includes('/new')) {

            const wsDynamic = new WSServer({ noServer: true });

            wsDynamic.on('connection', (req, ws) => {
                // logger.info(new URL(req.url, 'ws://' + req.headers.host + '/'));
                ws.on('message', (message) => {
                    logger.info('message on wsnew:', message + '');
                });
                ws.send('welcome on wsnew');
            });

            wsDynamic.handleUpgrade(request, socket, head, (ws) => {
                wsDynamic.emit('connection', request, ws);
            });

        } else if (pathname.includes('/foo')) {

            wss1.handleUpgrade(request, socket, head, (ws) => {
                wss1.emit('connection', request, ws);
            });

        } else if (pathname.includes('/bar')) {

            wss2.handleUpgrade(request, socket, head, (ws) => {
                wss2.emit('connection', request, ws);
            });

        } else {
            socket.destroy();
        }
    });

    server.on('request', app);

    server.on('error', e => {
        logger.info(e);
        rejecter('server error');
    });

    server.listen(8080, () => {
        logger.info('app server listening on http://localhost:8080')
        resolver('server started');
    })

    return new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });
}

const yargs = require('yargs')
    .usage('npm start -- -c <config file> -s <silent>')
    .options({
        config: {
            alias: 'c',
            describe: 'config file',
        },
        silent: {
            alias: 's',
            describe: 'run without logging',
        }
    })
    .argv;

if (require.main === module) {
    server(yargs.config ? require('./' + yargs.config) : {}, yargs.silent)
    .then(message => {
        console.log(message);
    })
    .catch(message => {
        console.error(message);
    });
}

module.exports = {
    server
};

