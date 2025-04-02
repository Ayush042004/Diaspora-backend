import multer from "multer";

const storage = multer.diskStorage({ //allows to specify how files should be stored on the server 
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

 export const upload = multer({ 
     storage, 
}); 