module.exports = (sequelize, Sequelize)=>{

    function getCurrentISTDate() {
        const currentDate = new Date();
        const utcOffset = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000); // in milliseconds
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
        return new Date(utcOffset + istOffset);
    }

    const patientReports = sequelize.define('patientReports',{
       
        reportFileName:{
            type:Sequelize.STRING
        },
        reporDownloadtUrl:{
            type:Sequelize.STRING
        },
        reportType:{
            type:Sequelize.STRING
        },
        reportfileSize:{
            type:Sequelize.BIGINT
        },
        uploadedBy:{
            type: Sequelize.INTEGER
        },
        reportUploadDate: {
            type: Sequelize.DATE,
            defaultValue: getCurrentISTDate 
        }
    })
    return patientReports;
}