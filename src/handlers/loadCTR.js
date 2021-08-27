const dbHelper = require("../helpers/dbHelper");
const tablesConfig = require("../configs/tablesconfig.json");

module.exports.main = async (event) => {
  const warehouseTables = Object.keys(tablesConfig);
  try {
    console.log("attempting to load");
    console.log(decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " ")));
    console.log(event.Records[0].s3.bucket.name);
    const dbPool = dbHelper.GetDbPool(process.env.host, process.env.password, process.env.user);
    // if (await dbPool.query("SELECT NOW()")) console.log("connection successful");
    await dbHelper.copyTables(
      process.env.redshiftObjectsBucket,
      event.Records[0].s3.object.key.replace(/\+/g, " "),
      dbPool,
      warehouseTables,
      process.env.redshiftrole
    );
    await dbHelper.cleanup(warehouseTables, dbPool);
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
