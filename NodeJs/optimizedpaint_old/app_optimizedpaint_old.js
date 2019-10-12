const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log("Somebody went to '/optimizedpaint_old'!");
    res.sendFile(__dirname + '/index.html');
});

module.exports = router;