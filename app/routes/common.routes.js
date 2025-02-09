module.exports = app => {
    const commonAPI = require('../controllers/common.controller.js')

    app.get('/getcount', commonAPI.getPatientDetlCount)
    app.post('/sendmsg',commonAPI.sendsms)

    app.get('/api/files/template', commonAPI.downloadTemplate);

    app.post('/user/loggedInuser',commonAPI.createLoggedInUserRec)
}