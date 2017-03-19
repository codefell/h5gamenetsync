import asyncio
import websockets
import datetime
import random 
import aiomysql
import sys

class Client:

    allClient = set()

    @asyncio.coroutine
    def sendMsgAll(msg):
        for client in Client.allClient:
            yield from client.sendMsg(msg)

    def __init__(self, websocket):
        self.websocket = websocket
        self.sendQueue = asyncio.Queue()
        Client.allClient.add(self)

    @asyncio.coroutine
    def loop(self):
        self.rc = asyncio.ensure_future(self.send)
        self.sc = asyncio.ensure_future(sendCoro(websocket))
        yield from asyncio.wait([sc, rc])
        Client.allClient.remove(websocket)
        print("client loop end")

    @asyncio.coroutine
    def sendMsg(self, msg):
        yield from self.sendQueue.put(msg)

    @asyncio.coroutine
    def sendCoro(self):
        try:
            while True:
                msg = yield from self.sendQueue.get()
                print("send " + msg)
                yield from self.websocket.send(msg);
        except websockets.exceptions.ConnectionClosed as e:
            print("sendCoro close")
        finally:
            self.rc.cancel()

    @asyncio.coroutine
    def recvCoro(self):
        try:
            while True:
                msg = yield from self.websocket.recv()
                yield from onRecvMsg(msg)
        except websockets.exceptions.ConnectionClosed as e:
            print("recvCoro close")
        finally:
            self.sc.cancel()

    @asyncio.coroutine
    def onRecvMsg(self, msg):
        yield from Client.sendMsgAll(msg)

@asyncio.coroutine
def serve(websocket, path):
    print("new websocket" + path)
    client = Client(websocket)
    yield from client.loop()

loop = asyncio.get_event_loop()
start_server = websockets.serve(serve, '127.0.0.1', 8000)
loop.run_until_complete(start_server)

try:
    loop.run_forever()
except KeyboardInterrupt as e:
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
