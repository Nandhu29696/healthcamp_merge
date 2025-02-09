const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is installed

const { getNextSerialNumber } = require('./SerialNumber.controller');
const db = require('../models');
const Utils = require('../utill/Utils');

const patientDetlsDB = db.patientDetls
const campDB = db.campPlanning
const userDB = db.user
const RoleDB = db.role

const patientDetUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("Please upload an Excel file!");
        }

        const userid = req.body.userid;
        const path = `${__basedir}/resources/static/assets/uploads/${req.file.filename}`;

        // Read the Excel file
        const rows = await readXlsxFile(path);
        if (!rows.length) {
            return res.status(400).send("Excel file is empty or improperly formatted.");
        }

        // Skip the header
        rows.shift();

        const prefixU = 'NHU';
        const prefix = 'NHP';

        // Fetch role data for patients
        const roleData = await RoleDB.findOne({
            where: { name: 'Patient' },
            attributes: ['id']
        });

        if (!roleData) {
            return res.status(404).send({ message: "Role 'Patient' not found." });
        }



        for (const row of rows) {
            const [_, fullName, age, gender, contactNo, reasonForVisiting, campID] = row;

            const formattedContactNo = contactNo === 'NA' ? '' : contactNo;
            const formattedAge = age === 'NA' ? null : age;

            let formattedGender;
            switch (gender) {
                case 'M':
                    formattedGender = 'male';
                    break;
                case 'F':
                    formattedGender = 'female';
                    break;
                default:
                    formattedGender = 'others';
                    break;
            }


            if (!fullName && !contactNo && !campID) {
                return res.status(400).send({
                    message: "Please add Patient fullname, Contact No, and Camp ID to upload the data."
                });
            }

            if (campID) {
                const camp = await campDB.findOne({ where: { campID: campID } });
                if (!camp) {
                    return res.status(400).send({ message: "Camp ID not found. No record will be added related to incorrect Camp ID." });
                }
            }
            const validMobile = Utils.validateMobileNum(contactNo)
            if (!validMobile) {
                res.status(400).send({
                    message: "Mobile number not valid. Please check your mobile number!"
                })
            }


            const AutoUserID = await getNextSerialNumber(prefixU);
            const createPassword = `${fullName.substring(0, 4)}${AutoUserID}`;
            const userDetl = {
                userID: AutoUserID,
                fullName,
                contactNo: formattedContactNo,
                created_by: userid,
                roleId: roleData.id,
                password: bcrypt.hashSync(createPassword, 8),
                password2: bcrypt.hashSync(createPassword, 8),
                isActive: true,
                isDeleted: false
            };
            const data = await userDB.create(userDetl);


            const serialNumber = await getNextSerialNumber(prefix);
            const patient_detail = {
                patientID: serialNumber,
                patientFullName: fullName,
                age: formattedAge,
                gender: formattedGender,
                contactNo: formattedContactNo,
                reasonForVisiting,
                created_by: userid,
                userId: userid,
                activeStatus: true
            };
            const patientNew = await patientDetlsDB.create(patient_detail);


            if (campID) {
                const camp = await campDB.findOne({ where: { campID: campID } });
                if (camp && patientNew) {
                    await camp.addPatientDetls(patientNew);
                }
            }
        }

        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Could not upload the file: " + error.message,
        });
    }
};

module.exports = { patientDetUpload };
