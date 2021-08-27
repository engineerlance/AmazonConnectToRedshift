const AWS = require("aws-sdk");
const s3 = new AWS.S3();

module.exports = awshelper = {
  GetFromS3: async (Bucket, Key) => {
    const bucketParams = {
      Bucket: Bucket,
      Key: Key,
    };
    const s3object = await s3.getObject(bucketParams).promise();
    return s3object.Body.toString("utf-8");
  },
  ExportToS3: async (Bucket, Key, redshiftObject) => {
    return await s3
      .putObject({
        Bucket: Bucket,
        Key: Key,
        Body: redshiftObject,
      })
      .promise();
  },
  GetAllObjectsFromS3: async (Bucket) => {
    const bucketParams = {
      Bucket: Bucket,
    };
    const s3objects = await s3.listObjects(bucketParams).promise();
    return s3objects.Contents.map((a) => a.Key);
  },
  parseObject: (object) => {
    return JSON.parse("[" + object.split("}{").join("},{") + "]");
  },
};
