const multer = require('multer');


// Set up Multer to store files in memory (buffer) 
const upload = multer({ 
    limits: { fileSize: 100 * 1024 * 1024 }, 
    storage: multer.memoryStorage() 
});

module.exports = upload;