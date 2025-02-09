const db = require('../models')
const config = require('../config/auth.config');
const { getNextSerialNumber } = require('./SerialNumber.controller');
const Utils = require('../utill/Utils')
const { Sequelize } = require('sequelize');

const userDB = db.user;
const Role = db.role;
const OrgnDB = db.organizationTypes;

const CampDet = db.campPlanning;
const Op = db.Sequelize.Op;

var validator = require("node-email-validation");
var bcrypt = require("bcryptjs");
const { assignCamptoUser } = require('./campPlan.controller');

const adduserDetls = async (req, res) => {

    try {
        if (req.body.fullName == "" || req.body.email == "" || req.body.contactNO == "") {
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
            } else if (req.body.zipCode < 0 || req.body.zipCode > 999999) {
                res.status(400).send({
                    status: "FAILED",
                    message: "Invalid ZIP code."
                });

            } else {
                let dateofBirth = req.body.dateOfBirth;
                if (!dateofBirth || !Utils.isValidDate(dateofBirth)) {
                    dateofBirth = null;
                }

                let zipcode = Utils.preprocessZipcode(req.body.zipCode)
                
                let organizerId = Utils.preprocessInteger(req.body.organizerId)
                let organizationDetId = Utils.preprocessInteger(req.body.organizationDetId)

                const dobDate = new Date();
                const yearDate = dobDate.getFullYear();
                var createPassword = req.body.fullName.substring(0, 4) + yearDate
                const prefix = 'NHU'
                const serialNumber = await getNextSerialNumber(prefix);

                
                userDB.create({
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
                    roleId: req.body.roleId,
                    password: bcrypt.hashSync(createPassword, 8),
                    password2: bcrypt.hashSync(createPassword, 8),
                    organizer_Id: organizerId,
                    organizationDetId: organizationDetId,
                    isActive: true,
                    isDeleted: false
                })
                    .then(user => {
                        res.json({
                            status: "SUCCESS",
                            message: "User registered successfully!"
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            status: "ERROR",
                            message: err.message
                        });
                    });
            }
        }
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
}


const updateuserDetls = async (req, res) => {
    let id = req.params.id

    try {
        userDB.update(req.body, { where: { id: id } })
            .then(user => {

                res.json({
                    status: "SUCCESS",
                    message: "Updated successfully!",
                });
            });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

const getAllUsers = (req, res) => {
    userDB.findAll({
        where: {
            isDeleted: false
        },
        order: [['id', 'ASC']],
        include: [{
            model: Role,
            as: 'roles',
            attributes: ['name'],
            where: {
                name: {
                    // [Op.notIn]: ['Super Admin', 'admin']
                    [Op.notIn]: ['Patient'],
                }
            }
        }, {
            model: OrgnDB,
            as: 'organizationDet',
            attributes: ['id', 'orgName'],
        }
            // , {
            //     model: CampDet,
            //     as: 'campPlanningDet',
            //     attributes: ['campID', 'campName']

            // }
        ],
    }).then(userdata => {
        if (!userdata) {
            return res.json({
                status: "FAILED",
                message: "Empty list!"
            })
        }
        res.json({
            status: "SUCCESS",
            data: userdata
        })
    })
}

const deleteCampDet = async (req, res) => {
    let id = req.params.id

    try {
        const userDelt = await userDB.update({ isDeleted: true }, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "User details deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}

const getAllRoles = async (req, res) => {
    try {

        let roleDet = await Role.findAll({
            // where: { role_type: { [Op.ne]: 'P' } },
            order: [['name', 'ASC']]
        })
        res.status(200).send(roleDet)

    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

const getVolunteerRoles = async (req, res) => {
    try {

        let roleDet = await Role.findAll({
            where: { role_type: { [Op.eq]: 'S' } },
            order: [['name', 'ASC']]
        })
        res.status(200).send(roleDet)

    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

const getRoleUsersCount = async (req, res) => {
    try {
        const roleCounts = await userDB.findAll({
            attributes: [
                'roleId',
                [Sequelize.fn('COUNT', Sequelize.col('users.id')), 'userCount']
            ],
            group: ['roleId', 'roles.id', 'roles.name'],
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['name'],
                    where: {
                        name: {
                            [Sequelize.Op.ne]: 'Super Admin' // Exclude "super admin"
                        }
                    }
                }
            ]
        });

        const result = roleCounts.map(roleCount => ({
            // roleId: roleCount.roleId,
            roleName: roleCount.roles.name,
            userCount: roleCount.dataValues.userCount
        }));

        res.json(result);

    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });

    }
}

const getUserCountsMonthbased = async (req, res) => {
    try {
        const userCounts = await userDB.findAll({
            attributes: [
                [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'userCount']
            ],
            group: ['month'],
            order: [['month', 'ASC']],
        });

        const result = userCounts.map(userCount => ({
            month: userCount.dataValues.month,
            userCount: userCount.dataValues.userCount
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    adduserDetls,
    updateuserDetls,
    getAllUsers,
    deleteCampDet,
    getAllRoles, getVolunteerRoles, getRoleUsersCount,
    getUserCountsMonthbased
}

