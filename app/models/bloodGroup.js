module.exports = (sequelize, Sequelize) => {
    const BloodGroup = sequelize.define("bloodGroup", {
        bloodGroup: {
            type: Sequelize.STRING
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    })

    return BloodGroup;
}