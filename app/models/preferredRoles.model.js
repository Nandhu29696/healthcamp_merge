module.exports = (sequelize, Sequelize) => {
    const preferredRoles = sequelize.define("preferredRoles", {

        preferredRoleName: {
            type: Sequelize.STRING
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    });

    return preferredRoles;
};