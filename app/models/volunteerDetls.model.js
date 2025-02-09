module.exports = (sequelize, Sequelize) => {
    const VolunteerDetls = sequelize.define("volunteerDetls", {
        volunteerID: {
            type: Sequelize.STRING
        },
        volunteerName: {
            type: Sequelize.STRING
        },
        dateOfBirth: {
            type: Sequelize.DATEONLY
        },
        contactNo: {
            type: Sequelize.STRING,
            allowNull: false
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
        skillExpertise: {
            type: Sequelize.STRING
        },
        preferredRole: {
            type: Sequelize.STRING
        },
        isSlotPicks: {
            type: Sequelize.STRING
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    });
    return VolunteerDetls
}