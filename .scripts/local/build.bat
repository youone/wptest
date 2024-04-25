cd %~dp0\..\..

node %~dp0\createEnv.js

if %1==wasm goto WASM
if %1==doc goto DOC
if %1==package goto PACKAGE
if %1==test goto TEST
if %1==publish goto PUBLISH
if %1==image goto IMAGE
if %1==deploy goto DEPLOY

:WASM
docker run --rm  ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code %IMAGE_REGISTRY_PATH_MAIN%/emscripten/emsdk:2.0.34 bash -c "cd /code && source .scripts/cicd/jobs.sh; build-wasm"
goto:CLEANUP

:PACKAGE
rmdir /s /q package
docker run --rm  ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code %IMAGE_REGISTRY_PATH_MAIN%/node:18.17.1 bash -c "cd /code && source .scripts/cicd/jobs.sh; build-package"
goto:CLEANUP

:TEST
docker run --rm  ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code %IMAGE_REGISTRY_PATH_MAIN%/node:18.17.1 bash -c "cd /code && source .scripts/cicd/jobs.sh; test-package"
goto:CLEANUP

:PUBLISH
docker run --rm  ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code %IMAGE_REGISTRY_PATH_MAIN%/node:18.17.1 bash -c "cd /code && source .scripts/cicd/jobs.sh; publish-package"
goto:CLEANUP

:IMAGE
docker exec ^
--env-file %~dp0\env.txt ^
-it docker-dind /bin/sh -c "cd /code && source .scripts/cicd/dind_image.sh"
goto:CLEANUP

:DEPLOY
docker run --rm  ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code %IMAGE_REGISTRY_PATH%/dspdf-rocky8 bash -c "cd /code && source .scripts/cicd/jobs.sh; deploy-image"
goto:CLEANUP

:DOC
docker exec ^
--env-file %~dp0\env.txt ^
-it docker-dind /bin/sh -c "cd /code && source .scripts/cicd/dind_doc.sh"
goto:CLEANUP

:CLEANUP
del %~dp0\env.txt
goto:eof


