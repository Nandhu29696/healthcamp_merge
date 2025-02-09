const db = require('../models')
const config = require('../config/auth.config');

const preferredRoles = db.preferredRoles;

const addPreRole = async (req, res) => {
    let payload = {
        preferredRoleName: req.body.preferredRoleName,
        created_by: req.body.created_by,
        activeStatus: true
    }
    try {
        const existData = await preferredRoles.findOne({ where: { preferredRoleName: req.body.preferredRoleName } });

        if (req.body.preferredRoleName == "") {
            res.json({
                status: "FAILED",
                message: "Empty Input fields!"
            });
        }
        else if (existData) {
            res.json({
                status: "FAILED",
                message: "Preferred Role already present!"
            });
        } else {
            const data = await preferredRoles.create(payload)
            res.json({
                status: "SUCCESS",
                message: "Added!"
            });
        }

    } catch (error) {
        res.json({
            status: "FAILED",
            message: error
        });
    }
}

const getPreRoleDet = async (req, res) => {
    try {
        let preRole = await preferredRoles.findAll({
            where: { activeStatus: true },
            order: [['preferredRoleName', 'ASC']]
        })
        res.status(200).send(preRole)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error
        });
    }
}

const updatePreRole = async (req, res) => {
    let id = req.params.id
    try {
        const actvityDet = await preferredRoles.update(
            req.body, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Updated"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Update Failed",
        });
    }
}

const deletePreRole = async (req, res) => {
    let id = req.params.id

    try {
        const preRole = await preferredRoles.update({ activeStatus: false }, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}

module.exports = {
    addPreRole,
    getPreRoleDet,
    updatePreRole,
    deletePreRole
}