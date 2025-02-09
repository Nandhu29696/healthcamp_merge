const { default: axios } = require('axios')
const db = require('../models')
const https = require('https')
const patientDetDB = db.patientDetls
const campPlanDB = db.campPlanning
const userDetDB = db.user
const RoleDB = db.role
const Op = db.Sequelize.Op;

const path = require('path');
const fs = require('fs');

const loggedInDB = db.loggedInUsers

const getPatientDetlCount = async (req, res) => {
    try {
        let activePatientsCount = await patientDetDB.count({
            where: { activeStatus: true }
        });
        let activeCampCount = await campPlanDB.count({
            where: { activeStatus: true }
        });
        let activeUserCount = await userDetDB.count({
            where: {
                isActive: true
            }
            ,
            include: [{
                model: RoleDB,
                as: 'roles',
                attributes: ['name'],
                where: {
                    name: {
                        [Op.ne]: 'admin'
                    }
                }
            }]
        });

        res.json({
            patientcount: activePatientsCount,
            campCount: activeCampCount,
            userCount: activeUserCount
        });
    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });

    }
}
const agent = new https.Agent({
    rejectUnauthorized: false
})

const sendsms = async (phoneNumber, name, patientid) => {
    // const { phoneNumber, name, patientid } = req.body;

    try {
        const response = await axios.post('https://api.msg91.com/api/v5/flow', {
            flow_id: process.env.TEMPLATE_ID_PATIENT,
            sender: process.env.SENDER_ID,
            recipients: [{
                "mobiles": '91'.concat(phoneNumber),
                "name": name,
                "patientid": patientid
            }]
        }, {
            headers: {
                'authkey': process.env.AUTH_KEY,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent
        });
        return response
        // res.status(200).send(response.data);
    } catch (error) {
        return 'FAILED'
        // res.status(500).send('Error sending SMS');
        // res.json({
        //     status: "FAILED",
        //     message: error.response ? error.response.data : error.message
        // });
    }
}

const sendVolunteerSMS = async (phoneNumber, name, date, location) => {

    try {
        const response = await axios.post('https://api.msg91.com/api/v5/flow', {
            flow_id: process.env.TEMPLATE_ID_VOLUNTEER,
            sender: process.env.SENDER_ID,
            recipients: [{
                "mobiles": '91'.concat(phoneNumber),
                "name": name,
                "date": date,
                "location": location
            }]
        }, {
            headers: {
                'authkey': process.env.AUTH_KEY,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent
        });
        return response
    } catch (error) {
        // console.error(error);
        return 'FAILED'
    }
}

const downloadTemplate = async (req, res) => {
    const filePath = path.join(__basedir, '/resources/static/templates/Patients_upload_template.xlsx');

    console.log('file path', filePath);


    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }

        // Set headers and send the file
        res.download(filePath, 'template.xlsx', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error downloading file');
            }
        });
    });
}

const createLoggedInUserRec = async (req, res) => {
    try {
        let payload = {
            userId: req.body.id,
            fullName: req.body.fullName,
            email: req.body.email,
            isAuthenticated: req.body.isAuthenticated,
            role: req.body.role,
            message: 'LoggedIn details captured',
            loggedInDateTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        }

        const data = await loggedInDB.create(payload);
        res.json({
            status: "SUCCESS",
            message: "Added!"
        });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

module.exports = {
    getPatientDetlCount,
    sendsms, sendVolunteerSMS,
    downloadTemplate,
    createLoggedInUserRec
}