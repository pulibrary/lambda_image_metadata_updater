#!/usr/bin/env bash
cd dependencies/nodejs && rm -rf node_modules && rm package-lock.json
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x npm install --only=production
cd ../../
if [ $1 == "production" ]
then
  sam deploy --stack-name=image-metadata-extractor-production \
  --s3-prefix=image-metadata-extractor-production \
  --parameter-overrides='StageName="production", SourceBucket="iiif-image-production""' \
  --s3-bucket=aws-sam-cli-managed-default-samclisourcebucket-1j1ve93v4jqs9 \
  --region='us-east-1' \
  --capabilities='CAPABILITY_IAM' \
  --profile='figgy-deploy'
elif [ $1 == "staging" ]
then
  sam deploy --stack-name=image-metadata-extractor-staging \
  --s3-prefix=image-metadata-extractor-staging \
  --parameter-overrides='StageName="staging", SourceBucket="iiif-image-staging"' \
  --s3-bucket=aws-sam-cli-managed-default-samclisourcebucket-1j1ve93v4jqs9 \
  --region='us-east-1' \
  --capabilities='CAPABILITY_IAM' \
  --profile='figgy-deploy'
else
  echo 'Please enter either production or staging as the environment'
fi
