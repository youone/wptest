#!/usr/bin/env bash

build-wasm() {
# written for emscripten/emsdk:2.0.34
    cd wasm;
    mkdir build
    cd build
    cmake -DCMAKE_TOOLCHAIN_FILE="/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake" -DBUILD_TYPE=wasm -DCOMMIT_HASH=${CI_COMMIT_SHORT_SHA} .. || exit 1
    make || exit 1
    cd ..
    rm -rf build
}

build-package() {
# written for node:18.17.1
    echo "@dspdf:registry = https://${CI_SERVER_HOST}/api/v4/packages/npm/" > .npmrc
    echo "//gitlab.com/api/v4/packages/npm/:_authToken=${PERSONAL_ACCESS_TOKEN}" >>  .npmrc

    npm config set strict-ssl false;
    rm -f package-lock.json;
    npm install;
    npm run build;
    mkdir package;
    npm pack --pack-destination="./package";
    node .scripts/getPackageInfo.js name > package/name.txt;
    node .scripts/getPackageInfo.js version > package/version.txt;
    node .scripts/getPackageInfo.js namespace > package/namespace.txt;
}

test-package() {
# written for node:18.17.1
    echo "@dspdf:registry = https://${CI_SERVER_HOST}/api/v4/packages/npm/" > .npmrc
    echo "//gitlab.com/api/v4/packages/npm/:_authToken=${PERSONAL_ACCESS_TOKEN}" >>  .npmrc

    npm config set strict-ssl false;
    ls -al package;
    cp package/*.tgz .; # only works if the package is moved for some reason
    npx --node-options=--inspect -y -p `ls *.tgz` -c test-`cat package/name.txt`;
    rm -f `ls *.tgz`;
}

publish-package() {
# written for node:18.17.1
    npm config set strict-ssl false;
    cp package/*.tgz .;

    echo "@dspdf:registry=https://${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/npm/" > .npmrc
    echo "//${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${PERSONAL_ACCESS_TOKEN}" >> .npmrc

    cat .npmrc
    npm publish `ls *.tgz`;
}

deploy-image() {
# written for rocky8

    PACKAGE_VERSION=`cat package/version.txt`;
    PACKAGE_NAME=`cat package/name.txt`;
    IMAGE_NAME=$CI_REGISTRY/dspdf/$PACKAGE_NAME:latest;

    printf "\n\033[0;32mDEPLOYING IMAGE $IMAGE_NAME\033[0m \n";

    chmod 600 $SSHKEY_APP_SERVER;

    ssh -o StrictHostKeyChecking=no -i $SSHKEY_APP_SERVER root@dspdf.sys.utv ./deploy_image.sh $IMAGE_NAME
}

# build-image() {
# # written for docker:20.10.16-dind
#     echo BUILDING IMAGE;
#     ls -al package;
#     docker login -u $CI_REGISTRY_USER -p $PERSONAL_ACCESS_TOKEN $CI_SERVER_HOST;
#     docker build -t registry.$CI_SERVER_HOST/dspdf/$CI_PROJECT_TITLE:latest --progress=plain --build-arg PACKAGE_NAME=$CI_PROJECT_TITLE --no-cache .;
#     docker images;
#     docker push registry.$CI_SERVER_HOST/dspdf/$CI_PROJECT_TITLE:latest;
# }

# build-native() {
# }

# build-documentation() {
# }

echo RUNNING CICD JOB ...
PS4="\n\033[1;33m>>>\033[0m ";

if [ -f "cert.cer" ]; then
    export ADDITIONAL_CERTIFICATE=`cat cert.cer`
fi

set -x;

