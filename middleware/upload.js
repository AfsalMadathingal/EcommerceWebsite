const path =require('path')
const multer= require('multer')
const uuid = require('uuid');



// Multer configuration for handling a single file
const storageSingle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/uploads");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let uniqueFilename = uuid.v4() + ext;
    cb(null, uniqueFilename);
  },
});





const uploadSingle = multer({
  storage: storageSingle,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB, adjust as needed
  },
}).array('images', 3); // Limit to three single file uploads, 'images' should match the name attribute in the form

// ...

module.exports= uploadSingle
