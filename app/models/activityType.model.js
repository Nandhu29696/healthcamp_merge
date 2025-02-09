module.exports = (sequelize, Sequelize) => {
    const ActivityTypes = sequelize.define("activityTypes", {

        activityName: {
            type: Sequelize.STRING
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    });

    return ActivityTypes;
};