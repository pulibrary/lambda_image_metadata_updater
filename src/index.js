const AWS = require('aws-sdk')
const sharp = require('sharp')
var s3 = new AWS.S3()

const requestHandler = async function(event, context) {
  var tasks = event.tasks.map((task) => {
    let id = task.taskId
    let s3Key = task.s3Key
    let bucketArn = task.s3BucketArn
    let bucket = bucketArn.split(':').pop()
    return new ImageMetadataUpdater(bucket, s3Key).update()
  })
  return Promise.all(tasks)
}

class ImageMetadataUpdater {
  constructor (bucket, s3Key) {
    this.bucket = bucket
    this.key = s3Key
  }

  s3Object () {
    return s3.getObject({
      Bucket: this.bucket,
      Key: this.key
    })
  }

  async update () {
    var object = this.s3Object()
    var stream = object.createReadStream()
    const metaReader = sharp()
    var metadata = metaReader.metadata()
    stream.pipe(metaReader)
    var result = await metadata
    console.log(result)
    return result
  }
}

exports.handler = requestHandler
