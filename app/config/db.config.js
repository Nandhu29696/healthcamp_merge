const { Sequelize } = require("sequelize");
const fs = require('fs');



// module.exports = {
//   HOST:'127.0.0.1',
//   USER:'root',
//   PASSWORD:'nan2143',
//   DB:'jobportal',
//   dialect:'mysql',


//   pool:{
//       max:5,
//       min:0,
//       acquire:30000,
//       idle:10000
//   }
// }

// module.exports = {
//   HOST: "localhost",
//   USER: "postgres",
//   PASSWORD: "2143",
//   DB: "healthcare",
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };


// module.exports = {
//   HOST:'68.178.145.146',
//   USER:'hms_user',
//   PASSWORD:'hms@1#2$3',
//   DB:'hms',
//   dialect:'mysql',
//   port:3306,

//   pool:{
//     max:5,
//     min:0,
//     acquire:30000,
//     idle:10000
//   }
// }


// UAT Database 
module.exports = {
  HOST: 'nirmaan-hms.mysql.database.azure.com',
  USER: 'nirmaanhms',
  PASSWORD: 'qwerty@NHMS',
  DB: 'hms',
  dialect: 'mysql',
  ssl: true,
  port: 3306,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync(__basedir + "/resources/static/certificate/BaltimoreCyberTrustRoot.crt.pem")
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}


// PROD Database
// module.exports = {
//   HOST: 'nirmaan-hms.mysql.database.azure.com',
//   USER: 'nirmaanhms',
//   PASSWORD: 'qwerty@NHMS',
//   DB: 'nirmaanhms-db',
//   dialect: 'mysql',
//   ssl:true,
//   port: 3306,
//   dialectOptions: {
//     ssl: {
//       require:true,
//       rejectUnauthorized: false,
//       ca: fs.readFileSync(__basedir + "/resources/static/certificate/BaltimoreCyberTrustRoot.crt.pem")
//     }
//   },
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// }
