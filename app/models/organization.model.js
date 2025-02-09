
module.exports = (sequelize, Sequelize) =>{
    const OrganizationDet = sequelize.define('organizationDet',{
        orgName:{
            type: Sequelize.STRING
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    })
    return OrganizationDet
}