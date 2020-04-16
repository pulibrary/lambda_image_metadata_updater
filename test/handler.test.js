const { handler } = require("../src/index.js");
const fs = require('fs').promises;

jest.mock('aws-sdk', () => {
  var AWSMock = require('mock-aws-s3');
  AWSMock.config.basePath = `${process.cwd()}/test/tmp/buckets`
  return AWSMock
})

beforeEach(async () => {
  await fs.copyFile(`test/tmp/intermediate_file.tif`, "test/tmp/buckets/awsexamplebucket/intermediate_file.tif")
});

const event = {
  "invocationSchemaVersion": "1.0",
  "invocationId": "YXNkbGZqYWRmaiBhc2RmdW9hZHNmZGpmaGFzbGtkaGZza2RmaAo",
  "job": {
    "id": "f3cc4f60-61f6-4a2b-8a21-d07600c373ce"
  },
  "tasks": [
    {
      "taskId": "dGFza2lkZ29lc2hlcmUK",
      "s3Key": "intermediate_file.tif",
      "s3VersionId": "1",
      "s3BucketArn": "arn:aws:s3:us-east-1:0123456788:awsexamplebucket"
    }
  ]
}

test("extracts the width and height of an image stream", async () => {
  result = await handler(event, {})
});
