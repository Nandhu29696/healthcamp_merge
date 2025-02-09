const config = require('../config/db.config.js')

const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    dialectOptions: config.dialectOptions,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Static model
db.actvityTypes = require('../models/activityType.model.js')(sequelize, Sequelize);
db.serialNumber = require('../models/SerialNumber.model.js')(sequelize, Sequelize);
db.preferredRoles = require('../models/preferredRoles.model.js')(sequelize, Sequelize);
db.organizationTypes = require('../models/organization.model.js')(sequelize, Sequelize);
db.bloodGroup = require('../models/bloodGroup.js')(sequelize, Sequelize);


db.loggedInUsers = require('../models/loggedInUser.model.js')(sequelize, Sequelize);

//  User Authentication model

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.ROLES = ["user", "admin", "Super Admin", "Medical Volunteer", "Event Coordinator", "Awareness Campaigner", "Medical Assistant", "Health Educator"]
db.userOTPVerification = require("../models/UserOTPVerification.model.js")(sequelize, Sequelize);

db.role.hasMany(db.user, { as: 'users' });
db.user.belongsTo(db.role, {
  foreignKey: 'roleId',
  as: 'roles'
})

db.organizationTypes.hasMany(db.user, { as: 'users' });
db.user.belongsTo(db.organizationTypes, {
  foreignKey: 'organizer_Id',
  as: 'organizationDet'
});

db.inventoryDet = require('../models/inventoryDet.model.js')(sequelize, Sequelize);
db.inventoryDet.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'users'
})

db.campPlanning = require('../models/campPlanning.model.js')(sequelize, Sequelize);
db.campPlanning.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'users'
})

db.volunteerDetls = require('../models/volunteerDetls.model.js')(sequelize, Sequelize);
db.volunteerDetls.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'users'
});

db.campPlanning.belongsToMany(db.volunteerDetls, {
  through: "volunteer_camps",
  foreignKey: "campId",
  otherKey: "volunteerId"
});

db.volunteerDetls.belongsToMany(db.campPlanning, {
  through: "volunteer_camps",
  foreignKey: "volunteerId",
  otherKey: "campId"
});



db.patientDetls = require('../models/patientDetls.model.js')(sequelize, Sequelize);
db.patientDetls.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'users'
});
db.patientReports = require('../models/patientReports.model.js')(sequelize, Sequelize);

db.patientDetls.hasMany(db.patientReports, { as: 'patientReports' });


db.campPlanning.belongsToMany(db.patientDetls, {
  through: "patients_camps",
  foreignKey: "campId",
  otherKey: "patientId"
});

db.patientDetls.belongsToMany(db.campPlanning, {
  through: "patients_camps",
  foreignKey: "patientId",
  otherKey: "campId"
});



db.user.hasMany(db.campPlanning, { as: 'campPlanningDet' });
db.user.hasMany(db.patientDetls, { as: 'patientDetls' });
db.user.hasMany(db.patientReports, { as: 'patientReports' });
db.user.hasMany(db.volunteerDetls, { as: 'volunteerDetls' });



// db.campPlanning.hasMany(db.volunteerDetls, { as: 'volunteerDetls' })
//db.campPlanning.hasMany(db.patientDetls, { as: 'patientDetls' });




module.exports = db, sequelize;