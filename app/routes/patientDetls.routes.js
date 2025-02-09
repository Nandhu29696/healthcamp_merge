const uploadMiddleware = require('../middleware/upload.js');

module.exports = app => {

    const patientDetAPI = require('../controllers/patientDetls.controller')
    const patientReportAPI = require('../controllers/patientReports.controller')

    const uploadcsv = require("../middleware/uploadcsv.js");
    const uploadReports = require("../middleware/uploadReports.js");

    app.post('/addPatientDet', patientDetAPI.addPatientDetls)
    app.get('/getAllPatientDetls', patientDetAPI.getPatientDetls)
    app.get('/getCampPatientDetls', patientDetAPI.getPatientsCamps)
    app.get('/getOnePatientDetls/:id', patientDetAPI.getpatientCampDet)

    app.post('/getpatientusingMobileno', patientDetAPI.getpatientDetlswithPhoneNum)

    app.put('/updatePatientDet/:id', patientDetAPI.updatePatientDetls)
    app.put('/deletePatientDet/:id', patientDetAPI.deletePatientDetls)

    app.post('/assignCamptoPatients', patientDetAPI.assignCamptoPatients)
    app.get('/getPatientsNames', patientDetAPI.getPatientsNames)

    app.post("/uploadCSV", uploadcsv.single("file"), patientDetAPI.csvUpload);

    
    // const patientBulkUploadAPI = require('../controllers/patientDetlBulkdata.controller.js')
    
    // app.post("/patientUpload", uploadMiddleware, patientBulkUploadAPI.patientDetUpload);
    // app.post("/uploadReport", uploadReports, patientReportAPI.uploadPatientReports);
    // app.get('/getPatientReports/:patientID', patientReportAPI.getAllPatientReports)
    // app.post("/downloadattachment", patientReportAPI.downloadAttachments);
    // app.put('/deleteAttachment/:id', patientReportAPI.deleteAttachment)


}