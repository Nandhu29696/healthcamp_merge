const db = require('../models')

const InventoryDB = db.inventoryDet;
const { getNextSerialNumber } = require('./SerialNumber.controller');

const addInventoryDet = async (req, res) => {

    try {
        const prefix = 'NHIN'
        const inventryID = await getNextSerialNumber(prefix);

        let payload = {
            inventoryID: inventryID,
            itemName: req.body.itemName,
            categoryFixedAsset: req.body.categoryFixedAsset,
            categoryFloatingAsset: req.body.categoryFloatingAsset,
            quantity: req.body.quantity,
            unitPrice: req.body.unitPrice,
            supplierName: req.body.supplierName,
            receivedDate: req.body.receivedDate,
            expirationDate: req.body.expirationDate,
            currentStockLevel: req.body.currentStockLevel,
            created_by: req.body.userId,
            userId: req.body.userId,
            isActive: true
        }

        const data = await InventoryDB.create(payload);
        res.json({
            status: "SUCCESS",
            message: "Inventory Details created!"
        });

    }
    catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        });
    }
}

const getInventoryDetls = async (req, res) => {

    try {
        let inventoryDetls = await InventoryDB.findAll({
            where: { isActive: true },
            order: [['createdAt', 'ASC']]
        })
        res.send(200).send(inventoryDetls)
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error
        });
    }
}

const updateInventoryDet = async (req, res) => {
    let id = req.params.id

    try {
        const updateDet = await InventoryDB.update(req.body, { where: { id: id } });
        res.json({
            status: "SUCCESS",
            message: "Inventory details updated",
        });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error
        });
    }
}

const deleteInventory = async (req, res) => {
    let id = req.params.id

    try {
        const inventoryDet = await InventoryDB.update({ isActive: false }, { where: { id: id } });

        res.json({
            status: "SUCCESS",
            message: "Inventory details deleted"
        });
    } catch (error) {
        res.status(500).send({
            message: "Delete failed",
        });
    }
}

module.exports = {
    addInventoryDet, getInventoryDetls, updateInventoryDet, deleteInventory
}