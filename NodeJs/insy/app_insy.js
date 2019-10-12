const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log("Somebody went to '/insy'!");
    res.sendFile(__dirname + '/index.html');
});

router.get('/:dir', function(req, res){
    res.sendFile(__dirname + '/' + req.params.dir);
});

router.get('/:dir/:subdir', function(req, res){
    console.log("Somebody downloaded '" + req.params.subdir + "'!");
    res.sendFile(__dirname + '/' + req.params.dir + '/' + req.params.subdir);
});

module.exports = router;