PACKAGE_VERSION=`cat package/version.txt`;
PACKAGE_NAME=`cat package/name.txt`;

IMAGE_NAME=$CI_REGISTRY_IMAGE:latest;

echo "@dspdf:registry = https://${CI_SERVER_HOST}/api/v4/packages/npm/" > .npmrc
echo "//gitlab.com/api/v4/packages/npm/:_authToken=${PERSONAL_ACCESS_TOKEN}" >>  .npmrc
echo "//gitlab.com/api/v4/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${PERSONAL_ACCESS_TOKEN}" >> .npmrc
mv .npmrc package/.

printf "\n\033[0;35mBUILDING IMAGE $IMAGE_NAME FROM $IMAGE_REGISTRY_PATH_MAIN WITH NODE HEADERS @ $NODE_HEADERS_URL\033[0m \n";

docker login -u $CI_REGISTRY_USER -p $PERSONAL_ACCESS_TOKEN $CI_REGISTRY
docker build --build-arg IMAGE_REGISTRY_PATH=$IMAGE_REGISTRY_PATH_MAIN --build-arg NODE_HEADERS_URL=$NODE_HEADERS_URL -t $IMAGE_NAME --progress=plain  --no-cache .
docker system prune -f
docker images

printf "\n\033[0;35mPUBLISHING IMAGE AT $CI_REGISTRY $CI_REGISTRY_IMAGE\033[0m \n";
docker push $IMAGE_NAME

# chmod 600 $SSHKEY_APP_SERVER;
# ssh -o StrictHostKeyChecking=no -i $SSHKEY_APP_SERVER dspdf@dspdf.sys.utv ./deploy_image.sh $APP_NAME $IMAGE_NAME;

