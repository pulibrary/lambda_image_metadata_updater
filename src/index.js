const { S3Client, GetObjectCommand, CopyObjectCommand, S3ServiceException } = require('@aws-sdk/client-s3');
const sharp = require('sharp')

const requestHandler = async function(event, context) {
  const s3 = new S3Client({});
  var tasks = event.tasks.map((task) => {
    let id = task.taskId
    let s3Key = task.s3Key
    let bucketArn = task.s3BucketArn
    let bucket = bucketArn.split(':').pop()
    return (new ImageMetadataUpdater(s3, bucket, s3Key).update()).then(() => {
      return {
        "taskId": task.taskId,
        "resultCode": "Succeeded",
        "resultString": "Done"
      }
    })
  })
  const output = await Promise.all(tasks)
  return {
    "invocationSchemaVersion": "1.0",
    "treatMissingKeysAs" : "PermanentFailure",
    "invocationId" : event.invocationId,
    "results": output
  }
}

class ImageMetadataUpdater {
  constructor (client, bucket, s3Key) {
    this.client = client
    this.bucket = bucket
    this.key = s3Key
  }

  async update () {
    const getCommand = new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.key
    });
    const response = await this.client.send(getCommand)
    const metaReader = sharp({limitInputPixels: false});
    const metadata = metaReader.metadata();
    response.Body.pipe(metaReader);
    const result = await metadata
    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: this.key,
      CopySource: `/${this.bucket}/${this.key}`,
      Metadata: { "width": `${result.width}`, "height": `${result.height}`, "pages": `${result.pages}` },
      MetadataDirective: "REPLACE"
    });
    return this.client.send(copyCommand);
  }
}

exports.handler = requestHandler
