module.exports = (sequelize, Sequelize) => {
    const loggedInUser = sequelize.define('loggedInUser', {

        userId: {
            type: Sequelize.INTEGER
        },
        fullName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        },
        isAuthenticated:{
            type:Sequelize.BOOLEAN
        },
        message:{
            type:Sequelize.STRING
        },
        loggedInDateTime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return loggedInUser
}