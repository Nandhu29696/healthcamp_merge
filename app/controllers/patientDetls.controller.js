const db = require('../models')
const { getNextSerialNumber } = require('./SerialNumber.controller');
const patientDetlsDB = db.patientDetls
const campDB = db.campPlanning
const userDB = db.user
const RoleDB = db.role
const Op = db.Sequelize.Op;
const readXlsxFile = require("read-excel-file/node");
var bcrypt = require("bcryptjs");
const fs = require("fs");
const csv = require("fast-csv");
const Utils = require('../utill/Utils');
const { sendsms } = require('./common.controller');

const addPatientDetls = async (req, res) => {
    try {
        let roleData = await RoleDB.findOne({
            where: { name: 'Patient' }, attributes: ['id']
        })
        if (!req.body.patientFullName || !req.body.contactNo || !req.body.gender
            || !req.body.age) {
            res.status(400).send({
                status: "FAILED",
                message: "Empty Input fields!"
            });
        } else {
            const validMobile = Utils.validateMobileNum(req.body.contactNo)
            if (!validMobile) {
                res.status(400).send({ 
                    status: "FAILED",
                    message: "Mobile number not valid. Please check your mobile number!"
                });
            } else if (req.body.age < 0 || req.body.age > 200) {
                res.status(400).send({
                    status: "FAILED",
                    message: "Invalid Age. Age cannot be negative."
                });
            } else {
                const prefixU = 'NHU'
                const AutoUserID = await getNextSerialNumber(prefixU);
                var createPassword = req.body.patientFullName.substring(0, 4) + AutoUserID
                let zipcode = Utils.preprocessZipcode(req.body.zipCode)
                let userDetl = {
                    userID: AutoUserID,
                    fullName: req.body.patientFullName,
                    contactNo: req.body.contactNo,
                    email: req.body.email,
                    street: req.body.address,
                    city: req.body.city,
                    state: req.body.state,
                    zipCode: zipcode,
                    created_by: req.body.created_by,
                    roleId: roleData.id,
                    password: bcrypt.hashSync(createPassword, 8),
                    password2: bcrypt.hashSync(createPassword, 8),
                    isActive: true,
                    organizer_Id: 1,
                    organizationDetId: 1,
                    isDeleted: false
                }
                const data = await userDB.create(userDetl);
                const prefix = 'NHP'
                const serialPNumber = await getNextSerialNumber(prefix);
                patientDetlsDB.create({
                    userId: data.id,
                    patientID: serialPNumber,
                    patientFullName: req.body.patientFullName,
                    age: req.body.age,
                    gender: req.body.gender,
                    bloodgroup: req.body.bloodgroup,
                    contactNo: req.body.contactNo,
                    emailAddress: req.body.emailAddress,
                    address: req.body.address,
                    city: req.body.city,
                    state: req.body.state,
                    zipCode: zipcode,
                    maritalStatus: req.body.maritalStatus,
                    occupation: req.body.occupation,
                    primaryLang: req.body.primaryLang,
                    existingMedicalCond: req.body.existingMedicalCond,
                    currentMedications: req.body.currentMedications,
                    allergiesToMedications: req.body.allergiesToMedications,
                    familyMedicalHistory: req.body.familyMedicalHistory,
                    reasonForVisiting: req.body.reasonForVisiting,
                    emergencyContactName: req.body.emergencyContactName,
                    emergencyContactNo: req.body.emergencyContactNo,
                    emergencyPresonRelationship: req.body.emergencyPresonRelationship,
                    aboutCampKnown: req.body.aboutCampKnown,
                    otherInfo: req.body.otherInfo,
                    isAgree: req.body.isAgree,
                    created_by: req.body.created_by,
                    activeStatus: true
                }).then(patientDet => {
                    if (req.body.campId !== undefined) {
                        campDB.findOne({
                            where: { id: req.body.campId }
                        }).then(camp => {
                            if (patientDet) {
                                patientDetlsDB.findOne({
                                    where: {
                                        id: patientDet.id
                                    }
                                }).then(patient => {
                                    camp.addPatientDetls(patient).then(() => {
                                        // const smsResult = sendsms(patient.contactNo, patient.fullName, patient.patientID)
                                        res.json({
                                            status: "SUCCESS",
                                            message: "Patient registered successfully!"
                                        })
                                    })
                                })
                            }
                        })
                    }
                    else {
                        // const smsResult = sendsms(patientDet.contactNo, patientDet.fullName, patientDet.patientID)
                        res.json({
                            status: "SUCCESS",
                            message: "Patient registered successfully!"
                        })
                    }
                }).catch(err => {
                    res.status(500).json({
                        status: "ERROR",
                        message: err.message
                    });
                });
            }
        }
    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getPatientDetls = async (req, res) => {

    let patnDetls = await patientDetlsDB.findAll({
        where: { activeStatus: true },
        order: [['id', 'DESC']],
        include: [
            {
                model: userDB,
                as: 'users',
                attributes: ['id', 'fullName']
            },
            {
                model: campDB,
                attributes: ['id', 'campName']
            }
        ]
    })
    res.status(200).send(patnDetls)
}
const getpatientCampDet = async (req, res) => {
    try {
        let PatientDet = await patientDetlsDB.findOne({
            where: {
                activeStatus: true,
                id: req.params.id
            },
            order: [['id', 'DESC']],
            include: [
                {
                    model: userDB,
                    as: 'users',
                    attributes: ['id', 'fullName']
                }]
        })
        res.status(200).send(PatientDet)
    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getpatientDetlswithPhoneNum = async (req, res) => {

    try {
        let patientDetls = await patientDetlsDB.findAll({
            where: {
                activeStatus: true,
                contactNo: req.body.contactNo
            },
            order: [['id', 'ASC']],
            include: [
                {
                    model: userDB,
                    as: 'users',
                    attributes: ['id', 'fullName']
                }]

        })
        res.status(200).send(patientDetls)
    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

const updatePatientDetls = async (req, res) => {
    let id = req.params.id
    try {
        if (req.body.fullName == "" || req.body.contactNO == "" || req.body.gender == ""
            || req.body.age == "") {
            res.status(400).send({
                status: "FAILED",
                message: "Empty Input fields!"
            });
        } else {
            const validMobile = Utils.validateMobileNum(req.body.contactNo)
            if (!validMobile) {
                res.status(400).send({
                    status: "FAILED",
                    message: "Mobile number not valid. Please check your mobile number!"
                });
            } else if (req.body.age < 0 || req.body.age > 200) {
                res.status(400).send({
                    status: "FAILED",
                    message: "Invalid Age entered."
                });

            } else {
                patientDetlsDB.update(req.body, { where: { id: id } }).then(patient => {
                    if (req.body.campId !== undefined) {

                        campDB.findOne({
                            where: { id: req.body.campId }
                        }).then(camp => {
                            camp.addPatientDetls(patient).then(() => {
                                res.json({
                                    status: "SUCCESS",
                                    message: "Updated"
                                });
                            })
                        })
                    }

                });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Update Failed",
        });
    }
}
const deletePatientDetls = async (req, res) => {
    let id = req.params.id
    try {
        const detl = await patientDetlsDB.update({ activeStatus: false }, { where: { id: id } });
        res.json({
            status: "SUCCESS",
            message: "Patient Details deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}
//Excel bulk upload 
const patientDetUpload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        const userid = req.body.userid;
        const campID = req.body.campId;
        let path =
            __basedir + "/resources/static/assets/uploads/" + req.file.filename;
        readXlsxFile(path).then(async (rows) => {
            // skip header
            rows.shift();
            const prefix = 'NHP'
            const prefixU = 'NHU'
            let roleData = await RoleDB.findOne({
                where: { name: 'Patient' }, attributes: ['id']
            })
            try {
                for (const row of rows) {
                    if (!row[1] || !row[4] || !row[5]) {
                        res.status(400).send({
                            message: "Please add Patient fullname, Contact No, and Camp ID to upload the data "
                        });
                    }
                    const AutoUserID = await getNextSerialNumber(prefixU);
                    var createPassword = row[1].substring(0, 4) + AutoUserID
                    let userDetl = {
                        userID: AutoUserID,
                        fullName: row[1],
                        contactNo: row[4],
                        created_by: userid,
                        roleId: roleData.id,
                        password: bcrypt.hashSync(createPassword, 8),
                        password2: bcrypt.hashSync(createPassword, 8),
                        isActive: true, isDeleted: false
                    }
                    const data = await userDB.create(userDetl);
                    const serialNumber = await getNextSerialNumber(prefix);
                    let patient_detail = {
                        patientID: serialNumber,
                        patientFullName: row[1],
                        age: row[2] ? parseFloat(row[2]) : null,
                        gender: row[3],
                        contactNo: row[4],
                        reasonForVisiting: row[5],
                        created_by: userid,
                        userId: userid,
                        activeStatus: true
                    };
                    const patientNew = await patientDetlsDB.create(patient_detail);
                    if (campID !== undefined) {
                        campDB.findOne({
                            where: { id: campID }
                        }).then(camp => {
                            if (patientNew) {
                                patientDetlsDB.findOne({
                                    where: {
                                        id: patientNew.id
                                    }
                                }).then(patient => {
                                    camp.addPatientDetls(patient).then(() => {
                                    })
                                })
                            }
                        })
                    }
                }
            } catch (error) {
                res.status(400).send({
                    message: error.message
                });
            }
            res.status(200).send({
                message: "Uploaded the file successfully: " + req.file.originalname,
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + error.message,
        });
    }
};
//CSV bulk upload
const csvUpload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }
        let patient_details = [];
        let path = __basedir + "/resources/static/assets/uploads/" + req.file.filename;
        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                patient_details.push(row);
            })
            .on("end", () => {
                patientDetlsDB.bulkCreate(patient_details)
                    .then(() => {
                        res.status(200).send({
                            message:
                                "Uploaded the file successfully: " + req.file.originalname,
                        });
                    })
                    .catch((error) => {
                        res.status(500).send({
                            message: "Fail to import data into database!",
                            error: error.message,
                        });
                    });
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};
const getPatientsCamps = async (req, res) => {
    try {
        const patientdetls = await patientDetlsDB.findAll({
            include: campDB
        });
        res.json(patientdetls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const assignCamptoPatients = (req, res) => {
    try {
        campDB.findOne({
            where: { id: req.body.campId }
        }).then(camp => {
            if (req.body.userIds) {
                patientDetlsDB.findAll({
                    where: {
                        id: {
                            [Op.or]: req.body.userIds
                        }
                    }
                }).then(volunteer => {
                    camp.addPatientDetls(volunteer).then(() => {
                        res.json({
                            status: "SUCCESS",
                            message: "Patient assigned successfully!"
                        })
                    })
                })
            }
        })
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getPatientsNames = async (req, res) => {
    try {
        const patients = await patientDetlsDB.findAll({
            where: { activeStatus: true },
            attributes: ['id', 'patientID', 'patientFullName']
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    addPatientDetls,
    getPatientDetls,
    getpatientCampDet,
    getpatientDetlswithPhoneNum,
    updatePatientDetls,
    deletePatientDetls,
    patientDetUpload,
    csvUpload,
    getPatientsCamps,
    assignCamptoPatients,
    getPatientsNames
}