module.exports = app => {
    const activityType = require('../controllers/activityType.controller')

    app.post('/addActivity', activityType.addTypes)
    app.get('/getAllActivityDetls', activityType.getActivityDet)
    app.put('/updateDet/:id', activityType.updateActivities)
    app.put('/deleteDet/:id', activityType.deleteActivities)
}