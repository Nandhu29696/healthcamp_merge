module.exports = (sequelize, Sequelize) => {
    const patientDetls = sequelize.define('patientDetls', {
        patientID: {
            type: Sequelize.STRING,
        },
        patientFullName: {
            type: Sequelize.STRING
        },
        age: {
            type: Sequelize.FLOAT,
            allowNull: true,
            validate: {
                isFloat: true,
            },
        },
        gender: {
            type: Sequelize.STRING
        },
        bloodgroup: {
            type: Sequelize.STRING
        },
        contactNo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        emailAddress: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.STRING
        },
        zipCode: {
            type: Sequelize.BIGINT,
        },
        maritalStatus: {
            type: Sequelize.STRING
        },
        occupation: {
            type: Sequelize.STRING
        },
        primaryLang: {
            type: Sequelize.STRING
        },
        existingMedicalCond: {
            type: Sequelize.STRING
        },
        currentMedications: {
            type: Sequelize.STRING
        },
        allergiesToMedications: {
            type: Sequelize.STRING
        },
        familyMedicalHistory: {
            type: Sequelize.STRING
        },
        reasonForVisiting: {
            type: Sequelize.STRING
        },
        emergencyContactName: {
            type: Sequelize.STRING
        },
        emergencyContactNo: {
            type: Sequelize.STRING
        },
        emergencyPresonRelationship: {
            type: Sequelize.STRING
        },
        aboutCampKnown: {
            type: Sequelize.STRING
        },
        otherInfo: {
            type: Sequelize.STRING
        },
        isAgree: {
            type: Sequelize.BOOLEAN
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        activeStatus: {
            type: Sequelize.BOOLEAN
        }
    })

    return patientDetls;
}