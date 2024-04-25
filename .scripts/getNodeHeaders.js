#!/usr/bin/env node

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

const HEADERS_URL = `${process.env.NODE_HEADERS_URL}/node-v18.17.1-headers.tar.gz`;

console.log('FETCHING NODE HEADERS @', HEADERS_URL);

const file = fs.createWriteStream("lib/headers.tgz");

http.get(HEADERS_URL, function(response) {
   response.pipe(file);
   file.on("finish", () => {
       file.close();
       console.log("Download Completed");
   });
});