const helper = require("./awsHelper");
let concatenatedObject = "";

connectbulkparser = async (Bucket) => {
  try {
    objectKeys = await helper.GetAllObjectsFromS3(Bucket);

    for (const s3object of objectKeys) {
      console.log("concatenating CTR" + s3object);
      const rawObject = await helper.GetFromS3(Bucket, decodeURIComponent(s3object));
      concatenatedObject += rawObject;
    }
    helper.ExportToS3(
      "bucket",
      "key",
      helper.BuildRedshiftObject(helper.parseObject(concatenatedObject))
    );
  } catch (e) {
    console.error(e);
  }
};
