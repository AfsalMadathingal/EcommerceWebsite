const path =require('path')
const multer= require('multer')
const uuid = require('uuid');


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
    fileSize: 1024 * 1024 * 5,
  },
}).array('images', 3); 

module.exports= uploadSingle
