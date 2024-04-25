const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    entry: {
        index: './src/index.js',
        demo_api: './src/demo-api.js',
        demo_ws: './src/demo-ws.js',
        demo_wasm: './src/demo-wasm.js',
    },
    mode: 'production',
    output: {
        filename: '[name].js',
        library: 'demo',
        libraryTarget: 'umd'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    resolve: {
        fallback: {path: false, fs: false, crypto: false}
    },
    devServer: {
        port: 3333,
        headers: { 
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"        
        },
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        },
        static: [
            {
                directory: path.join(__dirname, 'doc'),
                publicPath: '/doc',
            },
            // {
            //     directory: path.join(__dirname, 'lib/mathjax'),
            //     publicPath: '/doc/mathjax',
            // },
        ],
        proxy: {
            '/websocket': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                ws:true,
                pathRewrite: {
                    '^/websocket':''
                  }
            },
            '/api': {
                target: 'http://localhost:8080/api',
                changeOrigin: true,
                pathRewrite: {
                    '^/api':''
                  }
            },
            '/jsontest': {
                target: 'http://echo.jsontest.com/',
                changeOrigin: true,
                pathRewrite: {
                    '^/jsontest':''
                  }
            }
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "./src/index.html",
        }),
        new HtmlWebpackPlugin({
            chunks: ['demo_api'],
            filename: "demo-api.html",
            template: "./src/demo-api.html",
        }),
        new HtmlWebpackPlugin({
            chunks: ['demo_ws'],
            filename: "demo-ws.html",
            template: "./src/demo-ws.html",
        }),
        new HtmlWebpackPlugin({
            chunks: ['demo_wasm'],
            filename: "demo-wasm.html",
            template: "./src/demo-wasm.html",
        })
    ],
    devtool: 'eval-cheap-source-map',
}

module.exports = async (env) => {

    if (process.env.WEBPACK_SERVE) {
        if (env.server) {
            config.devtool = 'eval-cheap-source-map';
            config.stats = {warnings: false};
    
            const {server} = require("./server.js");
    
            server({}, false)
                .then(message => {
                    console.log(message);
                })
                .catch(message => {
                    console.error(message);
                });
        }
    }
    else {
        config.devtool = 'source-map';
    }

    return config;
}