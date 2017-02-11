function Client(divId)
{
    this.divId = divId;
    this.sceneInfo = initScene(divId);
    this.gu = new GameUnit(-100 + Math.random() * 200, 
        -100 + Math.random() * 200, 0xFF0000, this.sceneInfo.scene);
    //this.conn = new Connection(0, 0, );
    Client.allClient[divId] = this;

    $('#'+divId).click(function (e) {
            var rect0 = $(this)[0].getBoundingClientRect();
            var x = Math.floor(e.clientX - rect0.left);
            var y = Math.floor(e.clientY - rect0.top);
            x = -(100 - x);
            y = 100 - y;
            Client.allClient[this.id].gu.setRealPos(x, y);
            });
}
Client.allClient = [];
