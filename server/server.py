import asyncio
import websockets
import datetime
import random 
import aiomysql
import sys
import logging

'''
serverInfo = {
    start: False,
    startTime: 0,
    syncFrame: 0
    syncInfo: [],
    syncSeq: [],
}
'''

class Client:

    allClient = set()

    async def sendMsgAll(msg):
        for client in Client.allClient:
            await client.sendMsg(msg)

    def __init__(self, websocket):
        self.websocket = websocket
        self.sendQueue = asyncio.Queue()
        Client.allClient.add(self)

    async def close(self):
        self.rc.cancel()
        self.sc.cancel()
        await asyncio.wait([self.sc, self.rc, self.websocket.close()])

    async def loop(self):
        self.rc = asyncio.ensure_future(self.recvCoro())
        self.sc = asyncio.ensure_future(self.sendCoro())
        await asyncio.wait([self.sc, self.rc])
        await self.websocket.close()
        Client.allClient.remove(self)
        print("client loop end")

    async def sendMsg(self, msg):
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
            print(str(e))
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
            print(str(e))
        finally:
            self.sc.cancel()

    async def onRecvMsg(self, msg):
        print("recv msg", msg)
        await Client.sendMsgAll(msg)

async def serve(websocket, path):
    print(dir(websocket))
    print("new websocket" + path)
    client = Client(websocket)
    await client.loop()

loop = asyncio.get_event_loop()
loop.set_debug(True)
logging.basicConfig(level=logging.DEBUG)
start_server = websockets.serve(serve, '127.0.0.1', 8000)
loop.run_until_complete(start_server)

try:
    loop.run_forever()
except KeyboardInterrupt as e:
    start_server.close()
    cos = []
    for client in set(Client.allClient):
        cos.append(client.close())
    if cos:
        loop.run_until_complete(asyncio.wait(cos))
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
