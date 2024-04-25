cd %~dp0\..\..

node %~dp0\createEnv.js

docker run -d --privileged ^
--env-file %~dp0\env.txt ^
-v %cd%:/code -w /code --name docker-dind %IMAGE_REGISTRY_PATH_MAIN%/docker:20.10.16-dind
