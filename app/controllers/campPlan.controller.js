const db = require('../models')
const { getNextSerialNumber } = require('./SerialNumber.controller');
const { Sequelize } = require('sequelize');
const ExcelJS = require('exceljs');
const UserData = db.user;
const CampPlanDet = db.campPlanning;
const patientDB = db.patientDetls;
const VolunteerDB = db.volunteerDetls;
const RoleDB = db.role;
const OrgnDB = db.organizationTypes;
const Op = db.Sequelize.Op;
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const csv = require("fast-csv");
const Utils = require('../utill/Utils');
const addCampDetails = async (req, res) => {
    if (!req.body.campName || !req.body.campDate
        || !req.body.startTime || !req.body.endTime || !req.body.street
        || !req.body.city || !req.body.state || !req.body.zipCode) {
        res.status(400).send({
            status: "FAILED",
            message: "Please fill mandatory fields!"
        });
    } else if (req.body.zipCode < 0) {
        res.status(400).send({
            status: "FAILED",
            message: "Invalid ZIP code. ZIP code cannot be negative."
        });
    } else {
        try {
            const prefix = 'NHC'
            const serialNumber = await getNextSerialNumber(prefix);
            // const timeSlots = Utils.createTimeSlots(req.body.startTime, req.body.endTime);
            let payload = {
                campID: serialNumber,
                campName: req.body.campName,
                campDate: req.body.campDate,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                description: req.body.description,
                activityType: req.body.activityType,
                otherActivityType: req.body.otherActivityType,
                timeSlotAllocation: req.body.timeSlotAllocation,
                organizerID: req.body.organizerID,
                created_by: req.body.created_by,
                userId: req.body.userId,
                activeStatus: true,
                campstatus: "New"
            }
            const data = await CampPlanDet.create(payload);
            res.json({
                status: "SUCCESS",
                message: "Camp Details created!"
            });
        }
        catch (error) {
            res.json({
                status: "FAILED",
                message: error
            });
        }
    }
}
const getAllCampDetails = async (req, res) => {
    try {
        let campdet = await CampPlanDet.findAll({
            where: { activeStatus: true },
            order: [['createdAt', 'ASC']],
            include: [{
                model: UserData,
                as: 'users',
                attributes: ['id', 'fullName'],
                include: [{
                    model: OrgnDB,
                    as: 'organizationDet',
                    attributes: ['id', 'orgName'],
                }]
            }]
        })
        res.status(200).send(campdet)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getAllCampNames = async (req, res) => {
    try {
        let campdet = await CampPlanDet.findAll({
            where: { activeStatus: true },
            order: [['createdAt', 'ASC']],
            attributes: ['id', 'campID', 'campName']
        })
        res.status(200).send(campdet)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getOneCampName = async (req, res) => {
    let id = req.params.id
    try {
        let campdet = await CampPlanDet.findOne({
            where: { id: id },
            attributes: ['id', 'campID', 'campName']
        })
        res.json({
            status: "SUCCESS",
            data: campdet
        });
        res.status(200).send(campdet)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getOneCampDet = async (req, res) => {
    let id = req.params.id
    try {
        let campdet = await CampPlanDet.findOne({
            where: { id: id },
            attributes: ['id', 'campID', 'campName'],
            include: [{
                model: UserData,
                as: 'users',
                attributes: ['id', 'fullName', 'contactNo', 'email'],
                include: [{
                    model: RoleDB,
                    as: 'roles',
                    attributes: ['id', 'name'],
                }]
            }, {
                model: VolunteerDB,
                as: 'volunteerDetls',
                include: [{
                    model: UserData,
                    as: 'users',
                    attributes: ['id', 'fullName', 'contactNo', 'email'],
                    include: [{
                        model: RoleDB,
                        as: 'roles',
                        attributes: ['id', 'name']
                    }]
                }]
            }, {
                model: patientDB,
                as: 'patientDetls',
                where: { activeStatus: true },
                order: [['id', 'ASC']],
                include: [{
                    model: UserData,
                    as: 'users',
                    attributes: ['id', 'fullName', 'contactNo', 'email'],
                    include: [{
                        model: RoleDB,
                        as: 'roles',
                        attributes: ['id', 'name']
                    }]
                }]
            }]
        })
        res.json({
            status: "SUCCESS",
            data: campdet
        });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getCampNameDet = async (req, res) => {
    let id = req.params.id
    try {
        let campdet = await CampPlanDet.findOne({
            where: { id: id },
            attributes: ['id', 'campID', 'campName'],
        })
        res.status(200).send(campdet)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const updateCampDet = async (req, res) => {
    let id = req.params.id
    if (!req.body.campName || !req.body.campDate
        || !req.body.startTime || !req.body.endTime || !req.body.street
        || !req.body.city || !req.body.state || !req.body.zipCode) {
        res.status(400).send({
            status: "FAILED",
            message: "Please fill mandatory fields!"
        });
    }
    else if (req.body.zipCode < 0 || req.body.zipCode > 999999) {
        res.status(400).send({
            status: "FAILED",
            message: "Invalid ZIP code."
        });
    } else if (req.body.endTime && req.body.startTime && req.body.endTime < req.body.startTime) {
        res.status(400).send({
            status: "FAILED",
            message: "End time cannot be earlier than start time",
        });
    } else {
        try {
            // const newTimes = Utils.createTimeSlots(startTime, endTime);
            // const updateData = {
            //     ...req.body
            //      ,timeSlotAllocation: newTimes.join(', ')
            // }
            const campDet = await CampPlanDet.update(req.body, { where: { id: id } });
            res.json({
                status: "SUCCESS",
                message: "Camp details updated",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Update Failed",
            });
        }
    }
}
const deleteCampDet = async (req, res) => {
    let id = req.params.id
    try {
        const campDet = await CampPlanDet.update({ activeStatus: false }, { where: { id: id } });
        res.json({
            status: "SUCCESS",
            message: "Camp details deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}
const assignCamptoUser = (req, res) => {
    try {
        CampPlanDet.findOne({
            where: { id: req.body.campId }
        }).then(camp => {
            if (req.body.userIds) {
                VolunteerDB.findAll({
                    where: {
                        id: {
                            [Op.or]: req.body.userIds
                        }
                    }
                }).then(volunteer => {
                    camp.addVolunteerDetls(volunteer).then(() => {
                        res.json({
                            status: "SUCCESS",
                            message: "Volunteer assigned successfully!"
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
//Excel bulk upload 
const campDetUpload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        const userid = req.body.userid;
        let path =
            __basedir + "/resources/static/assets/uploads/" + req.file.filename;
        // const workbook = XLSX.readFile(path);
        // const sheetNames = workbook.SheetNames;
        // const sheet = sheetNames[0];
        // const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
        readXlsxFile(path).then(async (rows) => {
            // skip header
            rows.shift();
            const prefix = 'NHC'
            try {
                for (const row of rows) {
                    const convertedStartTime = Utils.convertTime(row[2]);
                    const convertedEndTime = Utils.convertTime(row[3]);
                    if (convertedStartTime === 'NaN:NaN:NaN' || convertedEndTime === 'NaN:NaN:NaN') {
                        res.status(400).send({
                            message: 'Invalid Time format'
                        });
                    }
                    const dateFormat = row[1]
                    if (parseInt(dateFormat)) {
                        res.status(400).send({
                            message: 'Invalid Date format'
                        });
                    }
                    const serialNumber = await getNextSerialNumber(prefix);
                    let camp_detail = {
                        campID: serialNumber,
                        campName: row[0],
                        campDate: dateFormat,
                        startTime: convertedStartTime,
                        endTime: convertedEndTime,
                        city: row[4],
                        description: row[5],
                        activityType: row[6],
                        timeSlotAllocation: row[7],
                        created_by: userid,
                        userId: userid,
                        activeStatus: true
                    };
                    await CampPlanDet.create(camp_detail);
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
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};
//CSV bulk upload
const csvUpload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }
        let bank_details = [];
        let path = __basedir + "/resources/static/assets/uploads/" + req.file.filename;
        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                bank_details.push(row);
            })
            .on("end", () => {
                CampPlanDet.bulkCreate(bank_details)
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
const mnthwiseCampPatientCount = async (req, res) => {
    try {
        const campCounts = await CampPlanDet.findAll({
            attributes: [
                [Sequelize.literal(`EXTRACT(MONTH FROM "campDate")`), 'month'],
                [Sequelize.literal(`EXTRACT(YEAR FROM "campDate")`), 'year'],
                [Sequelize.fn('COUNT', Sequelize.col('campID')), 'count'],
            ],
            group: ['year', 'month'],
            order: [['year', 'ASC'], ['month', 'ASC']],
        });
        res.json(campCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const generateCompleteReport = async (req, res) => {
    try {
        const reportData = await CampPlanDet.findAll({
            include: [
                {
                    model: patientDB,
                    as: 'patientDetls',
                    attributes: ['patientID', 'patientFullName', 'age'],
                },
                {
                    model: VolunteerDB,
                    as: 'volunteerDetls',
                    attributes: ['volunteerID', 'volunteerName', 'dateOfBirth'],
                },
            ],
            order: [['campDate', 'ASC']],
        });
        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Camp Report');
        const patientWorksheet = workbook.addWorksheet('Patient Report');
        const VolunteerWorksheet = workbook.addWorksheet('Volunteer Report');
        // Add headers for camp information
        worksheet.addRow(['Camp ID', 'Camp Name', 'Camp Date', 'Start Time', 'End Time']);
        // Populate camp data
        reportData.forEach((camp) => {
            worksheet.addRow([
                camp.campID,
                camp.campName,
                camp.campDate,
                camp.startTime,
                camp.endTime,
            ]);
            // Add headers for patient information if patients exist
            if (camp.patientDetls?.length) {
                patientWorksheet.addRow(['', 'Patient ID', 'Full Name', 'Age']);
                camp.patientDetls.forEach((patient) => {
                    patientWorksheet.addRow([
                        patient.id,
                        patient.patientID,
                        patient.patientFullName,
                        patient.age,
                    ]);
                });
            } else {
                patientWorksheet.addRow(['', 'No patient data available']);
            }
            // Add headers for volunteer information if volunteers exist
            if (camp.volunteerDetls?.length) {
                VolunteerWorksheet.addRow(['', 'Volunteer ID', 'Name', 'Date of Birth']);
                camp.volunteerDetls.forEach((volunteer) => {
                    VolunteerWorksheet.addRow([
                        volunteer.id,
                        volunteer.volunteerID,
                        volunteer.volunteerName,
                        volunteer.dateOfBirth,
                    ]);
                });
            } else {
                VolunteerWorksheet.addRow(['', 'No volunteer data available']);
            }
            // Add an empty row after each camp block
            worksheet.addRow([]);
            VolunteerWorksheet.addRow([]);
            patientWorksheet.addRow([]);
        });
        // Set response headers to prompt file download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=Camp_Report.xlsx'
        );
        // Write the Excel file to the response stream
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = {
    addCampDetails,
    getAllCampDetails,
    getAllCampNames,
    getOneCampDet, getCampNameDet, getOneCampName,
    updateCampDet,
    deleteCampDet,
    assignCamptoUser, campDetUpload, csvUpload,
    mnthwiseCampPatientCount,
    generateCompleteReport
}