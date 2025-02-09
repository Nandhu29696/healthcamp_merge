module.exports = app => {
    const campDetAPI = require('../controllers/campPlan.controller.js')

    const upload = require("../middleware/upload.js");
    const uploadcsv = require("../middleware/uploadcsv.js");


    app.post('/addCamp', campDetAPI.addCampDetails)
    app.get('/getAllCampdet', campDetAPI.getAllCampDetails)
    app.get('/getAllCampNames', campDetAPI.getAllCampNames)
    
    app.get('/getOneCamp/:id', campDetAPI.getOneCampDet)
    app.get('/getCampNameDet/:id', campDetAPI.getCampNameDet)
    // app.get('/getOneCampName/:id', campDetAPI.getOneCampName)
    app.put('/updateCamp/:id', campDetAPI.updateCampDet)
    app.put('/deleteCamp/:id', campDetAPI.deleteCampDet)

    app.post('/assignCampUsers', campDetAPI.assignCamptoUser)
    app.post("/upload", upload.single("file"), campDetAPI.campDetUpload);
    app.post("/uploadCSV", uploadcsv.single("file"), campDetAPI.csvUpload);

    app.get('/count-by-month',campDetAPI.mnthwiseCampPatientCount)
    
    app.get('/complete-report',campDetAPI.generateCompleteReport)
    

    // const serialNumAPI = require('../controllers/SerialNumber.controller.js')
    // app.get('/getNum',serialNumAPI.getNextSerialNumber)
}