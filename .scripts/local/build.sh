#!/usr/bin/env bash

if [ $1 = "package" ]; then
    echo BUILDING
    source .scripts/cicd/jobs.sh; build-package
fi

if [ $1 = "test" ]; then
    echo TESTING
    source .scripts/cicd/jobs.sh; test
fi

if [ $1 = "publish" ]; then
    echo PUBLISHING
    source .scripts/cicd/jobs.sh; publish-package
fi
