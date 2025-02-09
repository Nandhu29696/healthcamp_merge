const db = require('../models')
const patientDetlsDB = db.patientDetls
const patientReportDB = db.patientReports
const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.BLOB_STORAGE_ACC



async function createContainerIfNotExists(containerName) {

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();

    if (!exists) {
        console.log(`Creating new container: ${containerName}`);
        const createContainerResponse = await containerClient.create();
        console.log(`Container "${containerName}" created successfully`);
    } else {
        console.log(`Container "${containerName}" already exists`);
    }
    return containerClient;
}


const uploadPatientReports = async (req, res) => {
    try {
        const patientID = req.body.patientID;

        if (!req.files || !patientID) {
            return res.status(400).send('Files and patientID are required.');
        }

        // Ensure container exists for patient
        const containerClient = await createContainerIfNotExists(patientID.toLowerCase());

        // Handle multiple file uploads in parallel
        const uploadFilesPromises = req.files.map(async (file) => {
            const fileName = file.originalname;
            const blobName = `${Date.now()}-${fileName}`;

            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.size, {
                blobHTTPHeaders: { blobContentType: file.mimetype } // Set proper content type
            });

            if (uploadBlobResponse._response.status !== 201) {
                throw new Error('Failed to upload some files to Azure Blob Storage.');
            }

            const blobUrl = blockBlobClient.url;

            // Save report data to DB
            return patientReportDB.create({
                patientID: patientID,
                reportFileName: fileName,
                reporDownloadtUrl: blobUrl, // Save blob URL
                reportType: req.body.reportType,
                reportfileSize: file.size,
                uploadedBy: req.body.uploadedBy,
                reportUploadDate: new Date() // Capture current date
            });
        });

        // Wait for all files to be uploaded and saved
        const reportData = await Promise.all(uploadFilesPromises);

        // Send success response
        res.status(200).send({
            message: 'Files uploaded and report data saved successfully.',
            data: reportData
        });
    } catch (err) {
        console.error('Error during file upload:', err);
        res.status(500).send('An error occurred while uploading files.');
    }

}


module.exports = {
    uploadPatientReports
}
