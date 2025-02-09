module.exports = app => {
    const organizationDet = require('../controllers/organizationDet.controller')

    app.post('/addOrgn', organizationDet.addOrgns)
    app.get('/getAllOrgnDetls', organizationDet.getOrgnzationDet)
    app.put('/updateOrgDet/:id', organizationDet.updateOrganiztin)
    app.put('/deleteOrgDet/:id', organizationDet.deleteOrganztn)
}