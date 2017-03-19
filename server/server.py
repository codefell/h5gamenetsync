import asyncio
import websockets
import datetime
import random 
import aiomysql
import sys

conn_info = {}

async def sendCoro(websocket):
    try:
        while True:
            msg = await websocket.recv()
            print("recv " + msg)
            for q in list(conn_info.values()):
                await q['queue'].put(msg)
    except websockets.exceptions.ConnectionClosed as e:
        print("sendCoro close")
    finally:
        conn_info[websocket]['rc'].cancel()

async def recvCoro(websocket):
    try:
        while True:
            msg = await conn_info[websocket]['queue'].get()
            print("send " + msg)
            await websocket.send(msg)
    except websockets.exceptions.ConnectionClosed as e:
        print("recvCoro close")
    finally:
        conn_info[websocket]['sc'].cancel()

async def serve(websocket, path):
    rc = asyncio.ensure_future(recvCoro(websocket))
    sc = asyncio.ensure_future(sendCoro(websocket))
    conn_info[websocket] = {'queue':asyncio.Queue(),
        'rc': rc, 'sc': sc}
    await asyncio.wait([sc, rc])
    conn_info.pop(websocket)
    print("close conn");

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

start_server = websockets.serve(serve, '127.0.0.1', 8000)
loop.run_until_complete(start_server)

try:
    loop.run_forever()
except KeyboardInterrupt as e:
    print("exit")

