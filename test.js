function serverRecvHandler(msg) {
    console.log("server recv msg " + msg + ", time " + Math.floor(util.time()));
    conn.serverSend("echo " + msg);
}

function clientRecvHandler(msg) {
    console.log("client recv msg " + msg + ", time " + Math.floor(util.time()));
}

var conn = new Connection(5, 3, serverRecvHandler, clientRecvHandler);

$(document).keydown(function (e) {
    conn.clientSend("hello, world");
    console.log("client send msg at " + Math.floor(util.time()));
});

