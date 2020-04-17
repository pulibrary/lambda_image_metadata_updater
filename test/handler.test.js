const { handler } = require("../src/index.js");
const fs = require('fs').promises;
const AWS = require('aws-sdk-mock')
let copy = jest.fn((params, cb) => {
  cb(null, {})
})

beforeEach(async () => {
  AWS.mock("S3", "getObject", Buffer.from(require('fs').readFileSync("test/tmp/intermediate_file.tif")))
  AWS.mock("S3", "copyObject", copy)
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
  const result = await handler(event, {})
  expect(copy.mock.calls.length).toBe(1)
  const first_call_params = copy.mock.calls[0][0]
  expect(first_call_params.Metadata.height).toBe("3000")
  expect(first_call_params.Metadata.width).toBe("4500")
  expect(first_call_params.MetadataDirective).toBe("REPLACE")
  expect(first_call_params.CopySource).toBe("/awsexamplebucket/intermediate_file.tif")
  expect(first_call_params.Bucket).toBe("awsexamplebucket")
  expect(first_call_params.Key).toBe("intermediate_file.tif")
});
