import asyncio
import websockets
import datetime
import random 
import aiomysql
import sys
import json
import concurrent
import logging
import math
import traceback

class Util:
    def getInList(list, id):
        for e in list:
            if e.id == id: return e
    def move(x, y, dx, dy, speed, time):
        dis = speed * time
        len = math.sqrt(dx * dx + dy * dy)
        return (dx / len * dis + x,
            dy / len * dis + y)

class Config:
    frameInterval = 1 / 60 


class Player:
    def __init__(self, conn, id, color):
        self.id = id
        self.conn = conn
        self.ready = False
        self.units = []
        self.color = color

    def getInfo(self):
        units = []
        for unit in self.units:
            units.append(unit.getInfo())
        info = {
            "units": units
        }
        return info
    def setSyncInfo(self, syncInfo):
        unitsInfo = syncInfo["unitsInfo"] if ("unitsInfo" in syncInfo) else []
        for unitInfo in unitsInfo:
            unit = Util.getInList(self.units, unitInfo.id)
            unit.setSyncInfo(unitInfo)
    def addUnit(self, id, x, y, dx, dy, speed):
        unit = Unit(id, x, y, dx, dy, speed, self)
        self.units.append(unit)
        return unit
    def setPlayerInfo(self, playerInfo):
        unitsInfo = playerInfo["units"]
        for unitInfo in unitsInfo:
            unit = Unit(unitInfo["id"],
                unitInfo["x"],
                unitInfo["y"],
                unitInfo["dx"],
                unitInfo["dy"],
                unitInfo["speed"],
                self)
            self.units.append(unit)
    def sync1f(self):
        for unit in self.units:
            unit.sync1f()

class Unit:
    def __init__(self, id, x, y, dx, dy, speed, player):
        self.id = id,
        self.x = x
        self.y = y
        self.dx = dx
        self.dy = dy
        self.status = "idle",
        self.speed = speed
        self.player = player
    def getInfo(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "dx": self.dx,
            "dy": self.dy,
            "speed": self.speed
        }
    def setSyncInfo(self, info):
        if "direction" in info:
            self.dx = info["direction"]["x"]
            self.dy = info["direction"]["y"]
        if "status" in info:
            self.status = info["status"]
        if "speed" in info:
            self.speed = info["speed"]
    def sync1f(self):
        if self.status == "move":
            su.x, su.y = Util.move(
                self.x, self.y,
                self.dx, self.dy,
                self.speed, Config.frameInterval)


class Server:
    inst = None
    def getInst():
        if not Server.inst:
            Server.inst = Server()
        return Server.inst

    def __init__(self):
        self.start = False
        self.startTime = 0
        self.syncFrame = 0
        self.lastSendFrame = 0
        self.syncInfo = []
        self.syncSeq = []
        self.players = []

    async def loop(self):
        global loop
        try:
            while True:
                print("loop", loop.time())
                await self.update()
                await asyncio.sleep(Config.frameInterval * 10)
        except Exception as e:
            print(traceback.print_exc())
        #except concurrent.futures.CancelledError as e:
        #    raise e

    async def onLogin(self, conn, msg):
        loginPlayer = Player(conn, msg["id"], msg["color"])
        self.players.append(loginPlayer)
        for player in self.players:
            if player.id != msg["id"]:
                await player.conn.sendMsg({
                    "type": "addPlayer",
                    "playerId": loginPlayer.id,
                    "color": loginPlayer.color,
                })
                await loginPlayer.conn.sendMsg({
                    "type": "addPlayer",
                    "playerId": player.id,
                    "color": player.color,
                })
                if player.ready:
                    await loginPlayer.conn.sendMsg({
                        "type": "playerReady",
                        "playerInfo": player.getInfo(),
                        playerId: player.id,
                    })
    async def onReady(self, conn, msg):
        player = Util.getInList(self.players, msg["id"])
        player.setPlayerInfo(msg["playerInfo"])
        player.ready = True
        readyNum = 0
        for player in self.players:
            if player.ready:
                readyNum += 1
            if player.id != msg["id"]:
                await player.conn.sendMsg({
                    "type": "playerReady",
                    "playerInfo": msg["playerInfo"],
                    "playerId": msg["id"],
                })
        if readyNum == 2:
            self.start = True
            self.startTime = loop.time()
            await Connection.sendMsgAll({
                "type": "start"
            })
    
    async def onOp(self, conn, msg):
        si = {"playerId": msg["id"]}
        if "unitsInfo" in msg:
            si["unitsInfo"] = msg["unitsInfo"]
        self.syncInfo.append(si)

    async def update(self):
        if not self.start:
            return
        frameNum = int((loop.time() - self.startTime) / Config.frameInterval)
        if frameNum >= (self.lastSendFrame + 6):
            self.lastSendFrame = frameNum
            await Connection.sendMsgAll({
                "type": "sync",
                "frameIndex": frameNum,
                "syncInfo": self.syncInfo,
            })

            if len(self.syncInfo) > 0:
                self.syncSeq.append({
                    "frameIndex": frameNum,
                    "syncInfo": self.syncInfo,
                })
                self.syncInfo = []
    def eval(self):
        frameNum = int((loop.time() - self.startTime) / Config.frameInterval)
        frameNum = frameNum - (frameNum % 6)
        deltaFrame = frameNum - self.syncFrame
        for i in range(0, deltaFrame):
            for player in self.players:
                player.sync1f()
            self.syncFrame += 1;
            if len(self.syncSeq) > 0:
                if self.syncFrame == self.syncSeq[0].frameIndex:
                    syncInfo = self.syncSeq[0].syncInfo
                    for playerSyncInfo in syncInfo:
                        player = Util.getInList(self.players, playerSyncInfo["playerId"])
                        player.setSyncInfo(playerSyncInfo)
                    self.syncSeq = self.syncSeq[1:]

class Connection:

    allConnection = set()

    async def sendMsgAll(msg):
        for conn in Connection.allConnection:
            await conn.sendMsg(msg)

    def __init__(self, websocket):
        self.websocket = websocket
        self.sendQueue = asyncio.Queue()
        Connection.allConnection.add(self)

    async def close(self):
        self.rc.cancel()
        self.sc.cancel()
        await asyncio.wait([self.sc, self.rc, self.websocket.close()])

    async def loop(self):
        self.rc = asyncio.ensure_future(self.recvCoro())
        self.sc = asyncio.ensure_future(self.sendCoro())
        await asyncio.wait([self.sc, self.rc])
        await self.websocket.close()
        Connection.allConnection.remove(self)
        print("conn loop end")

    async def sendMsg(self, msg):
        msg = json.dumps(msg)
        await self.sendQueue.put(msg)

    async def sendCoro(self):
        try:
            while True:
                msg = await self.sendQueue.get()
                print("send " + msg)
                await self.websocket.send(msg);
        except websockets.exceptions.ConnectionClosed as e:
            print("sendCoro close")
        except Exception as e:
            print(e)
        finally:
            self.rc.cancel()

    async def recvCoro(self):
        try:
            while True:
                msg = await self.websocket.recv()
                await self.onRecvMsg(msg)
        except websockets.exceptions.ConnectionClosed as e:
            print("recvCoro close")
        except Exception as e:
            print(e)
        finally:
            self.sc.cancel()

    async def onRecvMsg(self, msg):
        print("recv msg", msg)
        msg = json.loads(msg)
        methodName = "on" + msg["type"].capitalize()
        method = getattr(Server.getInst(), methodName)
        await method(self, msg)
        #await Connection.sendMsgAll(msg)

async def serve(websocket, path):
    conn = Connection(websocket)
    await conn.loop()

loop = asyncio.get_event_loop()
loop.set_debug(True)
logging.basicConfig(level=logging.DEBUG)
start_server = websockets.serve(serve, '127.0.0.1', 8000)
loop.run_until_complete(start_server)
server_coro = asyncio.ensure_future(Server.getInst().loop())

try:
    loop.run_forever()
except KeyboardInterrupt as e:
    start_server.close()
    cos = []
    for conn in set(Connection.allConnection):
        cos.append(conn.close())
    if cos:
        loop.run_until_complete(asyncio.wait(cos))
    server_coro.cancel()
    loop.run_until_complete(asyncio.wait_for(server_coro, None))
    print("exit")

'''
pool = None
async def create_db_pool():
    global pool
    pool = await aiomysql.create_pool(
        host='127.0.0.1',
        user='root',
        password='',
        db='ims')
async def test_db_pool():
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute('select * from user')
            while True:
                r = await cur.fetchone()
                if not r: break
                print(str(r))
async def close_db_pool():
    pool.close()
    await pool.wait_closed()
loop = asyncio.get_event_loop()
loop.run_until_complete(create_db_pool())
loop.run_until_complete(test_db_pool())
loop.run_until_complete(close_db_pool())
sys.exit(0);
'''
