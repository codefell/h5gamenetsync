var server = {
    allConn: [],
    addConn: function (conn) {
        server.allConn.push(conn);
    },
    recvHandler: function (msg) {
        for (var i in server.allConn) {
            var conn = server.allConn[i];
            conn.serverSend(msg);
        }
    },
};
