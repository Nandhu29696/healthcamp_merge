module.exports = app => {
    const volunterAPI = require('../controllers/volunteer.controller.js')

    app.post('/addVolunteer', volunterAPI.addVolunteerDetls)

    app.get('/getVolunteerDet', volunterAPI.getVolunteerDetails)
    app.get('/getVolCamps', volunterAPI.getVolunteerCamps)
    app.get('/getVolunteersNames', volunterAPI.getVolunteersNames)
    app.get('/getOneVolunteerDet/:id', volunterAPI.getOneVolunteerDetail)
    // app.get('/getCampVolunteer/:id',volunterAPI.getCampbasedVolunteerDetls)
    app.put('/updateVolunteer/:id', volunterAPI.updateVolunteerDtl)
    app.put('/deleteVolunteer/:id', volunterAPI.deleteVolunteer)

}