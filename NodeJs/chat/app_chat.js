const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log("Somebody went to '/chat'!");
    if(req.query.name != null && req.query.name.trim() !== "")
        res.sendFile(__dirname + '/index.html');
    else
        res.sendFile(__dirname + '/register.html');
});

module.exports = router;