const awshelper = require("../helpers/awsHelper");
const objectBuilder = require("../helpers/objectBuiler");

module.exports.main = async (event) => {
  try {
    console.log("attempting to parse");
    console.log(decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " ")));
    console.log(event.Records[0].s3.bucket.name);
    const rawObject = await awshelper.GetFromS3(
      event.Records[0].s3.bucket.name,
      decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "))
    );
    await awshelper.ExportToS3(
      process.env.redshiftObjectsBucket,
      Date.now().toString() + "object" + ".json",
      objectBuilder.BuildRedshiftObject(awshelper.parseObject(rawObject))
    );
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error: e,
        },
        null,
        2
      ),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Success",
      },
      null,
      2
    ),
  };
};
