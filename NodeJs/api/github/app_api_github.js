const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/sendmessage', function(req, res){
    const header = req.headers;
    const msg = req.body;
    res.send('success!');
    if(header["x-github-event"] === "issues")
        if(msg.action === "opened")
            send("[" + msg.repository.name + "] " + msg.issue.user.login + " opened an issue called \"" + msg.issue.title + "\"");
    if(msg.action === "closed")
        send("[" + msg.repository.name + "] " + msg.issue.user.login + " closed an issue called \"" + msg.issue.title + "\"");
    else if(header["x-github-event"]  === "push") {
        var temp = "";
        msg.commits.forEach((i) => { temp += "\n - " + i.message; });
        send("[" + msg.repository.name + "] " + msg.pusher.name + " pushed the following changes:" + temp);
    } else if(header["x-github-event"]  === "pull_request")
        send("[" + msg.repository.name + "] " + msg.pull_request.user.login + " opened a pull request titled \"" + msg.pull_request.title + "\"!");
    else if(header["x-github-event"]  === "fork")
        send("[" + msg.repository.name + "] " + msg.forkee.owner.login + " forked!");
    else
        send("An unknown request has been sent:\n"+JSON.stringify(req.body));
});

function send(text){
    console.log("Somebody sent " + text + "!");
    fetch('https://api.telegram.org/bot966625238:AAEwp5LYgYYBXeyz_sLcgwZ2rsdgYDMy6Eg/sendMessage?chat_id=729494108&text=' + text);
}

module.exports = router;