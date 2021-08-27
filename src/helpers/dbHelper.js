var pg = require("pg");
let dbPool = null;
const tablesConfig = require("../configs/tablesconfig.json");

module.exports = dbhelper = {
  GetDbPool: function (host, pwd, user) {
    if (!dbPool) {
      dbPool = new pg.Pool({
        user: user,
        database: "dev",
        password: pwd,
        port: 5439,
        host: host,
      });
    }
    return dbPool;
  },
  InitializeTables: async function (Pool) {
    for (const table of Object.keys(tablesConfig)) {
      console.log(`Initialized table ${table}`);
      await Pool.query(`CREATE TABLE IF NOT EXISTS ${table}` + "(" + tablesConfig[table] + ")");
    }
    return void 0;
  },
  copyTables: async function (bucket, key, Pool, tablesToCopy, iamRole) {
    for (const table of tablesToCopy) {
      console.info(`copying ${table} from ${key}..........`);
      await Pool.query(
        `copy ${table} from '${bucket}/${key}' iam_role '${iamRole}'  
         format as json '${bucket}/configs/${table}jsonpath.json' timeformat 'YYYY-MM-DDTHH:MI:SS';`
      );
    }
    return void 0;
  },
  cleanup: async (tables, Pool) => {
    for (const table of tables) {
      if (table === "ctrrecord") {
        await Pool.query(
          `CREATE TABLE ctr_temp as (SELECT DISTINCT *,ROW_NUMBER() OVER (PARTITION BY recordid ORDER BY lastupdatetimestamp DESC) AS RowNumber  FROM ctrrecord);
          CREATE TABLE ctr_temp_cleaned as (SELECT * FROM ctr_temp WHERE RowNumber = 1);
          alter table ctr_temp_cleaned drop column rownumber;
          TRUNCATE ctrrecord;
          INSERT INTO ctrrecord
          (select * from ctr_temp_cleaned);
          drop table ctr_temp;
          drop table ctr_temp_cleaned;`
        );
        console.log(`table cleaned up ${table}`);
      } else if (table === "agent" || table === "queue" || table === "customer") {
        await Pool.query(
          `CREATE TABLE ${table}_tmp as (SELECT DISTINCT * FROM ${table} where ${table}id is not null);
          TRUNCATE ${table};
          INSERT INTO ${table} (select * from ${table}_tmp);
          drop table ${table}_tmp;`
        );
        console.log(`table cleaned up ${table}`);
      } else {
        return console.error("Unknown table");
      }
    }
    return void 0;
  },
};
