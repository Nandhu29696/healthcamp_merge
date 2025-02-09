const db = require('../models')
const config = require('../config/auth.config');

const organizationDet = db.organizationTypes;

const addOrgns = async (req, res) => {
    let payload = {
        orgName: req.body.orgName,
        created_by: req.body.created_by,
        activeStatus: true
    }
    const data = await organizationDet.create(payload)
    res.json({
        status: "SUCCESS",
        message: "Added!"
    });
}

const getOrgnzationDet = async (req, res) => {

    let orgDet = await organizationDet.findAll({
        where:{activeStatus:true},
        order: [['orgName', 'ASC']]
    })
    res.status(200).send(orgDet)
}

const updateOrganiztin = async (req, res) => {
    let id = req.params.id
    try {
        const orgDet = await organizationDet.update(req.body, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Organization details updated"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Update Failed",
        });
    }
}

const deleteOrganztn = async (req, res) => {
    let id = req.params.id

    try {
        const ortDet = await organizationDet.update({ activeStatus: false }, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Organization details deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Delete failed",
        });
    }
}

module.exports = {
    addOrgns,
    getOrgnzationDet,
    updateOrganiztin,
    deleteOrganztn
}