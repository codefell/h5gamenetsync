/*test connnection and update*/
/*
function serverRecvHandler(msg) {
    console.log("server recv " + msg + ", time " + Math.floor(util.time()));
    conn0.serverSend("echo " + msg);
    conn1.serverSend("echo " + msg);
}

function newClientRecvHandler(id) {
    return function (msg) {
        console.log("client " + id + " recv " + msg + ", time " + Math.floor(util.time()));
    }
}

var conn0 = new Connection(4, 0, serverRecvHandler, newClientRecvHandler("0"));
var conn1 = new Connection(2, 0, serverRecvHandler, newClientRecvHandler("1"));

$(document).keydown(function (e) {
    var key = String.fromCharCode(e.which);
    if (key == "A") {
        conn0.clientSend("hello, world");
        console.log("client 0 send at " + Math.floor(util.time()));
    }
    else if (key == "B") {
        conn1.clientSend("hello, world");
        console.log("client 1 send at " + Math.floor(util.time()));
    }
});
*/

$(function () {
    var gu = new GameUnit(-50, -50, 0xff0000);
    gu.setRealPos(80, 80);
});

