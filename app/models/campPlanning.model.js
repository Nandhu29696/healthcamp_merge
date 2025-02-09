module.exports = (sequelize, Sequelize) => {
    const Camp_PlanningDet = sequelize.define("campPlanningDet", {

        campID: {
            type: Sequelize.STRING
        },
        campName: {
            type: Sequelize.STRING
        },
        campDate: {
            type: Sequelize.DATEONLY
        },
        startTime: {
            type: Sequelize.TIME
        },
        endTime: {
            type: Sequelize.TIME
        }, 
        street: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.STRING
        },
        zipCode: {
            type: Sequelize.BIGINT
        },
        description: {
            type: Sequelize.TEXT
        },
        activityType: {
            type: Sequelize.STRING
        },
        otherActivityType: {
            type: Sequelize.STRING
        },
        timeSlotAllocation: {
            type: Sequelize.STRING
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        },
        campstatus: {
            type: Sequelize.STRING
        }
    });

    return Camp_PlanningDet;
};