const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

var hist = [];

fetch('https://api.telegram.org/bot966625238:AAEwp5LYgYYBXeyz_sLcgwZ2rsdgYDMy6Eg/getUpdates').then(
    u => {
        return u.json();
    }).then(
    json => {
        json.result.forEach(i => {
            hist.push(i.update_id);
        });
    }
);

setInterval(() => {
    fetch('https://api.telegram.org/bot966625238:AAEwp5LYgYYBXeyz_sLcgwZ2rsdgYDMy6Eg/getUpdates').then(
        u => { return u.json();}
    ).then(
        json => {
            json.result.forEach(i => {
                if(!hist.includes(i.update_id)){
                    console.log("new message!! " + i.message.text);
                    if(i.message.text === "hi"){
                        send(i.message.chat.id, 'hi!')
                    }
                    hist.push(i.update_id);
                }
            });
        }
    )
}, 3000);

router.post('/sendmessage', (req, res) => {
    const header = req.headers;
    const msg = req.body;
    res.send('success!');
    if (header["x-github-event"] === "issues") {
        if (msg.action === "opened")
            send(729494108, "[" + msg.repository.name + "] " + msg.issue.user.login + " opened an issue called \"" + msg.issue.title + "\"");
        if (msg.action === "closed")
            send(729494108, "[" + msg.repository.name + "] " + msg.issue.user.login + " closed an issue called \"" + msg.issue.title + "\"");
    } else if(header["x-github-event"]  === "push") {
        var temp = "";
        msg.commits.forEach((i) => {
            i.message.split("\n").forEach((o) => {
                temp += "\n - " + o;
            });
        });
        send(729494108, "[" + msg.repository.name + "] " + msg.pusher.name + " pushed the following changes:" + temp);
    } else if(header["x-github-event"]  === "pull_request")
        send(729494108, "[" + msg.repository.name + "] " + msg.pull_request.user.login + " opened a pull request titled \"" + msg.pull_request.title + "\"!");
    else if(header["x-github-event"]  === "fork")
        send(729494108, "[" + msg.repository.name + "] " + msg.forkee.owner.login + " forked!");
    else
        send(729494108, "An unknown request has been sent:\n"+JSON.stringify(req.body));
});

router.post('/update', (req, res) => {
    const header = req.headers;
    const msg = req.body;
    res.send('success!');
    console.log(msg);
});

function send(id, text){
    console.log("Somebody sent " + text + "!");
    fetch('https://api.telegram.org/bot966625238:AAEwp5LYgYYBXeyz_sLcgwZ2rsdgYDMy6Eg/sendMessage?chat_id=' + id + '&text=' + text);
}

module.exports = router;
