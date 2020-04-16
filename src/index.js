const AWS = require('aws-sdk');
var s3 = new AWS.S3();

const requestHandler = async function(event, context) {
  let tasks = event.tasks.map((task) => {
    let id = task.taskId
    let s3Key = task.s3Key
    let bucketArn = task.s3BucketArn
    let bucket = bucketArn.split(':').pop()
    new ImageMetadataUpdater(bucket, s3Key).update()
  })
  return Promise.all(tasks)
}

class ImageMetadataUpdater {
  constructor (bucket, s3Key) {
    this.bucket = bucket
    this.key = s3Key
  }

  update () {
    return Promise.resolve()
  }
}

exports.handler = requestHandler
