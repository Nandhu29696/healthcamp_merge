module.exports = (sequelize, Sequelize) => {
    const InventoryDet = sequelize.define('inventoryDetls', {
        inventoryID: {
            type: Sequelize.STRING
        },
        itemName: {
            type: Sequelize.STRING
        },
        categoryFixedAsset: {
            type: Sequelize.STRING
        },
        categoryFloatingAsset: {
            type: Sequelize.STRING
        },
        quantity: {
            type: Sequelize.INTEGER
        },
        unitPrice: {
            type: Sequelize.INTEGER
        },
        supplierName: {
            type: Sequelize.STRING
        },
        receivedDate: {
            type: Sequelize.DATEONLY
        },
        expirationDate: {
            type: Sequelize.DATEONLY
        },
        currentStockLevel: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        created_by: {
            type: Sequelize.INTEGER
        }
    });
    return InventoryDet;
}