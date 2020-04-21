const AWS = require('aws-sdk')
const sharp = require('sharp')

const requestHandler = async function(event, context) {
  const s3 = new AWS.S3()
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

  s3Object () {
    return this.client.getObject({
      Bucket: this.bucket,
      Key: this.key
    })
  }

  async update () {
    const object = this.s3Object()
    const stream = object.createReadStream()
    const metaReader = sharp()
    const metadata = metaReader.metadata()
    stream.pipe(metaReader)
    const result = await metadata
    return this.client.copyObject({
      Bucket: this.bucket,
      Key: this.key,
      CopySource: `/${this.bucket}/${this.key}`,
      Metadata: { "width": `${result.width}`, "height": `${result.height}` },
      MetadataDirective: "REPLACE"
    }).promise()
  }
}

exports.handler = requestHandler
