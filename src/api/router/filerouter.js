const express = require('express');
const cors = require('cors');
const router = express.Router();
const {
    filesget,
    fileadd,
    filedelet,
    fileupdate,
    fileget2
}= require('../contruler/filecontruler')

router.get('/fileget', filesget);
router.get('/file/:filename', fileget2);
router.post('/file',fileadd );
router.delete('/file/:id',filedelet);
module.exports = router;