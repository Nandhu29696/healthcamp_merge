module.exports = app => {
    const preferredRole = require('../controllers/preferredRoles.controller')

    app.post('/addPreRole', preferredRole.addPreRole)
    app.get('/getAllPreRoleDetls', preferredRole.getPreRoleDet)
    app.put('/updatePreRoleDet/:id', preferredRole.updatePreRole)
    app.put('/deletePreRoleDet/:id', preferredRole.deletePreRole)
}