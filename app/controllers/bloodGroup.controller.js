const db = require('../models')
const BloodGroupDB = db.bloodGroup;
const addBloodGroup = async (req, res) => {
    let payload = {
        bloodGroup: req.body.bloodGroup,
        activeStatus: true
    }
    try {
        const data = await BloodGroupDB.create(payload)
        res.json({
            status: "SUCCESS",
            message: "Added!"
        });
    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
const getBloodGroups = async (req, res) => {
    try {
        let bloodGroups = await BloodGroupDB.findAll({
            where: { activeStatus: true },
            order: [['bloodGroup', 'ASC']]
        })
        res.status(200).send(bloodGroups)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}
module.exports = {
    addBloodGroup,
    getBloodGroups
}