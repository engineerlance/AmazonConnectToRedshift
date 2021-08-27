const helper = require("./helper");
const tablesconfig = require("./tablesconfig");

connectbulkloader = async (Bucket) => {
  const warehouseTables = Object.keys(tablesconfig);
  try {
    objectKeys = await helper.GetAllObjectsFromS3(Bucket);
    const dbPool = helper.GetDbPool();
    for (const s3object of objectKeys) {
      if (!s3object.toString().startsWith("configs")) {
        console.log("attempting to load");
        console.log(s3object);
        await helper.copyTables("", s3object, dbPool, warehouseTables);
      }
    }
  } catch (e) {
    console.error(e);
  }
};
