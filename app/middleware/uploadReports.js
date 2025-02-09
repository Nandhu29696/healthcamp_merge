const multer = require('multer');

const uploadReports = multer({
    storage: multer.memoryStorage() 
});

module.exports = uploadReports;
