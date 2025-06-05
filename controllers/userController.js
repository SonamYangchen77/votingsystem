exports.getDashboard = (req, res) => {
    const user = req.user;
    res.render('dashboard', { user });
};
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads', 'voters')); // Go up one level if this is in a routes or controllers folder
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;

