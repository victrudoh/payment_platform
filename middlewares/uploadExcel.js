const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, "./Public/images/../../Uploads");
    cb(null, "./Public/images/../../");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "__" + file.originalname);
  },
});

const uploadExcel = multer({ storage: fileStorageEngine });

module.exports = uploadExcel;
