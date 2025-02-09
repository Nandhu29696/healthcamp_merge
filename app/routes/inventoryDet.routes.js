module.exports = app => {
    const inventoryAPI = require('../controllers/inventoryDet.controller')

    app.post('/addInventory', inventoryAPI.addInventoryDet)
    app.get('/getInventoryDetls', inventoryAPI.getInventoryDetls)
    app.put('/updateInventory/:id', inventoryAPI.updateInventoryDet)
    app.put('/deleteInventory/:id', inventoryAPI.deleteInventory)
}