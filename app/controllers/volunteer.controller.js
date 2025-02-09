const db = require('../models')
const { getNextSerialNumber } = require('./SerialNumber.controller');
const Utils = require('../utill/Utils')

const userDB = db.user
const Role = db.role;
const campDB = db.campPlanning;
const volunteerDB = db.volunteerDetls;
var validator = require("node-email-validation");
var bcrypt = require("bcryptjs");
const { assignCamptoUser } = require('./campPlan.controller');
const { Op } = require('sequelize');
const { sendsms, sendVolunteerSMS } = require('./common.controller');


const addVolunteerDetls = async (req, res) => {
    try {
        if (req.body.fullName == "" || req.body.email == "" || req.body.contactNo == "") {
            res.status(400).send({
                status: "FAILED",
                message: "Empty Input fields!"
            });
        } else if (!validator.is_email_valid(req.body.email)) {
            res.status(400).send({
                status: "FAILED",
                message: "Invalid EmailID entered!"
            });
        } else {
            const validMobile = Utils.validateMobileNum(req.body.contactNo)
            if (!validMobile) {
                res.status(400).send({
                    status: "FAILED",
                    message: "Mobile number not valid. Please check your mobile number!"
                });
            }
            // else if (req.body.zipCode < 0 || req.body.zipCode > 999999) {
            //     res.status(400).send({
            //         status: "FAILED",
            //         message: "Invalid ZIP code."
            //     });

            // }
            else {

                let roleData = await Role.findOne({
                    where: { name: 'Volunteer' }, attributes: ['id']
                })

                const prefix = 'NHU'
                const serialNumber = await getNextSerialNumber(prefix);
                var createPassword = req.body.fullName.substring(0, 4) + serialNumber

                let zipcode = Utils.preprocessZipcode(req.body.zipCode)

                let dateofBirth = req.body.dateOfBirth;
                if (!dateofBirth || !Utils.isValidDate(dateofBirth)) {
                    dateofBirth = null;
                }

                let userDetl = {
                    userID: serialNumber,
                    fullName: req.body.fullName,
                    dateOfBirth: dateofBirth,
                    contactNo: req.body.contactNo,
                    email: req.body.email,
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    zipCode: zipcode,
                    created_by: req.body.created_by,
                    roleId: roleData.id,
                    password: bcrypt.hashSync(createPassword, 8),
                    password2: bcrypt.hashSync(createPassword, 8),
                    organizer_Id: 2,
                    organizationDetId: 2,
                    isActive: true,
                    isDeleted: false
                }
                const data = await userDB.create(userDetl);

                const prefixV = 'NHV'
                const serialVNumber = await getNextSerialNumber(prefixV);

                volunteerDB.create({
                    userId: data.id,
                    volunteerID: serialVNumber,
                    volunteerName: req.body.fullName,
                    dateOfBirth: dateofBirth,
                    contactNo: req.body.contactNo,
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    zipCode: zipcode,
                    skillExpertise: req.body.skillExpertise,
                    preferredRole: req.body.preferredRole,
                    isSlotPicks: req.body.isSlotPicks,
                    created_by: req.body.created_by,
                    activeStatus: true

                }).then(volunteerDet => {
                    if (req.body.campId !== undefined) {

                        campDB.findOne({
                            where: { id: req.body.campId }
                        }).then(camp => {
                            if (volunteerDet) {
                                volunteerDB.findOne({
                                    where: {
                                        id: volunteerDet.id
                                    }
                                }).then(volunteer => {
                                    camp.addVolunteerDetls(volunteer).then(() => {
                                        const smsResult = sendVolunteerSMS(volunteer.contactNo, volunteer.volunteerName, camp.campDate, camp.city)

                                        res.json({
                                            status: "SUCCESS",
                                            message: "Volunteer registered successfully!"
                                        })
                                    });
                                })
                            }
                        })
                    }
                    else {
                        const smsResult = sendVolunteerSMS(volunteerDet.contactNo, volunteerDet.volunteerName, '', '')

                        res.json({
                            status: "SUCCESS",
                            message: "Volunteer registered successfully!"
                        })
                    }
                }).catch(err => {
                    res.status(500).json({
                        status: "ERROR",
                        message: err
                    });
                });
            }
        }
    } catch (error) {
        res.status(500).send({
            status: "FAILED",
            message: error
        });
    }
}

const getVolunteerDetails = async (req, res) => {
    try {
        let volunteerDls = await volunteerDB.findAll({
            where: { activeStatus: true },
            include: [{
                model: userDB,
                as: 'users',
                include: [{
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name']
                }]
            }]
        })
        res.status(200).send(volunteerDls)

    } catch (error) {
        res.status(500).send({
            status: "FAILED",
            message: error.message
        });

    }
}

const getOneVolunteerDetail = async (req, res) => {
    let id = req.params.id

    try {
        let volunteerDls = await volunteerDB.findAll({
            where: { id: id },
            include: [{
                model: userDB,
                as: 'users'
            }
            ]
        })

        res.status(200).send(volunteerDls)

    } catch (error) {
        res.status(500).send({
            status: "FAILED",
            message: error.message
        });

    }
}

const getVolunteerCamps = async (req, res) => {
    try {
        const volunteers = await volunteerDB.findAll({
            include: campDB
        });
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getVolunteersNames = async (req, res) => {
    try {
        const volunteers = await volunteerDB.findAll({
            where: { activeStatus: true },
            attributes: ['id', 'volunteerID', 'volunteerName']
        });
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteVolunteer = async (req, res) => {
    let id = req.params.id

    try {
        const volunteer = await volunteerDB.update({ activeStatus: false }, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Volunteer details deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}

const updateVolunteerDtl = async (req, res) => {
    let id = req.params.id

    const validMobile = Utils.validateMobileNum(req.body.contactNo)

    try {
        if (req.body.fullName == "" || req.body.email == "" || req.body.contactNo == "") {
            res.status(400).send({
                status: "FAILED",
                message: "Empty Input fields!"
            });
        } else if (!validator.is_email_valid(req.body.email)) {
            res.status(400).send({
                status: "FAILED",
                message: "Invalid EmailID entered!"
            });
        } else if (!validMobile) {
            res.status(400).send({
                status: "FAILED",
                message: "Mobile number not valid. Please check your mobile number!"
            });
        } else if (req.body.zipCode < 0 || req.body.zipCode > 999999) {
            res.status(400).send({
                status: "FAILED",
                message: "Invalid ZIP code."
            });

        } else {
            volunteerDB.update(req.body, { where: { id: id } })
                .then(data => {
                    res.json({
                        status: "SUCCESS",
                        message: "Updated successfully!",
                    });
                });

        }
    } catch (error) {
        res.status(500).send({
            status: "FAILED",
            message: error.message
        });
    }
}

module.exports = {
    addVolunteerDetls,
    updateVolunteerDtl,
    getVolunteerDetails,
    getOneVolunteerDetail,
    getVolunteerCamps,
    getVolunteersNames,
    deleteVolunteer
}