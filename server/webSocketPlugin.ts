import { Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import { Redis } from '@upstash/redis'
import { error } from 'console';
import { WebSocket } from "ws"

const redis = new Redis({
    url: 'https://polished-mantis-17335.upstash.io',
    token: 'AUO3AAIjcDE0OGFlN2FjNTczZDE0NzU0OWU5MjI4ZjhkYTUzZWJlYnAxMA'
})

interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
    accept?: string | undefined;
    "accept-language"?: string | undefined;
    "accept-patch"?: string | undefined;
    "accept-ranges"?: string | undefined;
    "access-control-allow-credentials"?: string | undefined;
    "access-control-allow-headers"?: string | undefined;
    "access-control-allow-methods"?: string | undefined;
    "access-control-allow-origin"?: string | undefined;
    "access-control-expose-headers"?: string | undefined;
    "access-control-max-age"?: string | undefined;
    "access-control-request-headers"?: string | undefined;
    "access-control-request-method"?: string | undefined;
    age?: string | undefined;
    allow?: string | undefined;
    "alt-svc"?: string | undefined;
    authorization?: string | undefined;
    "cache-control"?: string | undefined;
    connection?: string | undefined;
    "content-disposition"?: string | undefined;
    "content-encoding"?: string | undefined;
    "content-language"?: string | undefined;
    "content-length"?: string | undefined;
    "content-location"?: string | undefined;
    "content-range"?: string | undefined;
    "content-type"?: string | undefined;
    cookie?: string | undefined;
    date?: string | undefined;
    etag?: string | undefined;
    expect?: string | undefined;
    expires?: string | undefined;
    forwarded?: string | undefined;
    from?: string | undefined;
    host?: string | undefined;
    "if-match"?: string | undefined;
    "if-modified-since"?: string | undefined;
    "if-none-match"?: string | undefined;
    "if-unmodified-since"?: string | undefined;
    "last-modified"?: string | undefined;
    location?: string | undefined;
    origin?: string | undefined;
    pragma?: string | undefined;
    "proxy-authenticate"?: string | undefined;
    "proxy-authorization"?: string | undefined;
    "public-key-pins"?: string | undefined;
    range?: string | undefined;
    referer?: string | undefined;
    "retry-after"?: string | undefined;
    "sec-websocket-accept"?: string | undefined;
    "sec-websocket-extensions"?: string | undefined;
    "sec-websocket-key"?: string | undefined;
    "sec-websocket-protocol"?: string | undefined;
    "sec-websocket-version"?: string | undefined;
    "set-cookie"?: string[] | undefined;
    "strict-transport-security"?: string | undefined;
    tk?: string | undefined;
    trailer?: string | undefined;
    "transfer-encoding"?: string | undefined;
    upgrade?: string | undefined;
    "user-agent"?: string | undefined;
    vary?: string | undefined;
    via?: string | undefined;
    warning?: string | undefined;
    "www-authenticate"?: string | undefined;
}


interface ReqBase {
    operateType: "FIRST_SEND" | "SET_PLAYER" | "HEARTBEAT"
    roomId: string
    "x-pt-local-id": string
    "x-pt-stamp": number
}

interface ReqOperatePlayer extends ReqBase {
    playStatus: "PLAYING" | "PAUSED"
    speedRate: "1"
    contentStamp: number
    everyoneCanOperatePlayer?: "Y" | "N"
}

interface Room {
    _id: string
    title?: string
    content: ContentData
    oState: "OK" | "EXPIRED" | "DELETED"
    playStatus: "PLAYING" | "PAUSED"
    speedRate: SpeedRate
    contentStamp: number
    operateStamp: number
    operator: string
    createStamp: number
    owner: string
    participants: Participant[]
    config?: RoomConfig
}

/************* 以下是关于房间的设置和函数，跟本函数没有太大的关系  ***********/

interface ContentData {
    infoType: "podcast"
    audioUrl: string
    sourceType?: string
    title?: string
    description?: string
    imageUrl?: string
    linkUrl?: string
    seriesName?: string   // 播客专栏名称，比如 "商业就是这样"
    seriesUrl?: string    // 播客专栏链接
}

interface Participant {
    nickName: string
    enterStamp: number
    heartbeatStamp: number
    userAgent?: string
    guestId: string
    nonce: string
}

interface RoomConfig {
    everyoneCanOperatePlayer: "Y" | "N"
}

type SpeedRate = "0.8" | "1" | "1.2" | "1.5" | "1.7"

interface RoomStatus {
    roomId: string
    playStatus: "PLAYING" | "PAUSED"
    speedRate: SpeedRate
    operator: string
    contentStamp: number
    operateStamp: number
    everyoneCanOperatePlayer?: "Y" | "N"
}

interface ResToFe {
    responseType: "CONNECTED" | "NEW_STATUS" | "HEARTBEAT"
    roomStatus?: RoomStatus
}

let defaultRoomCfg: RoomConfig = {
    everyoneCanOperatePlayer: "Y"
}

// 最小可操作的时间间隔，小于该值，不响应
const MIN_DURATION_FOR_A_PERSON = 250

async function handle_first_send(ctx: FunctionContext, req: ReqBase): Promise<void> {
    const { roomId } = req
    const clientId: string = req["x-pt-local-id"]

    // Get room data from Redis
    const room: Room = await redis.get(roomId) as Room;
    let roomCfg: RoomConfig = room?.config ?? defaultRoomCfg

    const guestId = _getOperatorGuestId(clientId, room)
    if (!guestId) {
        ctx.socket.close()
        return
    }
    //@ts-ignore
    ctx.socket.roomId = roomId

    // 封装最新 RoomStatus
    let roomStatus: RoomStatus = {
        roomId,
        playStatus: room.playStatus,
        speedRate: room.speedRate,
        operator: room.operator,
        contentStamp: room.contentStamp,
        operateStamp: room.operateStamp,
        everyoneCanOperatePlayer: roomCfg.everyoneCanOperatePlayer
    }
    let resToFe: ResToFe = {
        responseType: "NEW_STATUS",
        roomStatus,
    }
    let msg: string = JSON.stringify(resToFe)
    console.log("ws::send:", msg)
    ctx.socket.send(msg)
}

async function handle_set_player(ctx: FunctionContext, req: ReqOperatePlayer): Promise<void> {
    try {
        const { roomId, playStatus, speedRate, contentStamp, everyoneCanOperatePlayer } = req
        const clientId: string = req["x-pt-local-id"]
        const room = await _getRoom(roomId) as Room

        if (!room) {
            console.log('获取房间失败，房间不存在，roomId：%s', roomId)
            return
        }
        let roomCfg: RoomConfig = room.config ?? defaultRoomCfg
        console.log(room.owner + "::" + clientId)
        const isOwner = room.owner === clientId
        if (!isOwner && roomCfg.everyoneCanOperatePlayer === "N") {
            console.log('房间owner对应错误......')
            return
        }

        const guestId = clientId // Since _getOperatorGuestId is not defined, directly use clientId as guestId
        if (!guestId) {
            console.log('获取房间clientId失败，clientId不存在......')
            ctx.socket.close()
            return
        }

        const s1 = req["x-pt-stamp"]
        const s2 = room.operateStamp
        if (guestId === room.operator) {
            const diff = s1 - s2
            if (diff < MIN_DURATION_FOR_A_PERSON) {
                console.log("时间差大于最小可操作的时间间隔")
                return
            }
        }

        let newStatus: Partial<Room> = {
            playStatus,
            speedRate,
            contentStamp,
            operateStamp: s1,
            operator: guestId,
        }
        let roomStatus: RoomStatus = {
            roomId,
            playStatus,
            speedRate,
            contentStamp,
            operateStamp: s1,
            operator: guestId,
        }
        if (everyoneCanOperatePlayer && isOwner) {
            roomStatus.everyoneCanOperatePlayer = everyoneCanOperatePlayer
            roomCfg.everyoneCanOperatePlayer = everyoneCanOperatePlayer
            newStatus.config = roomCfg
        }

        await _updateRoom

        const resToFe: ResToFe = {
            responseType: "NEW_STATUS",
            roomStatus,
        }
        const msg: string = JSON.stringify(resToFe)
        const clients = wss.clients

        if (clients.size === 0) throw error("ws.clients is null")

        clients.forEach((socket: WebSocket) => {
            //@ts-ignore
            console.log(socket.roomId + "::" + roomId)
            //@ts-ignore
            if (socket.roomId === roomId && socket.readyState === WebSocket.OPEN) {
                console.log('ws::setPlayer_send:', msg)
                socket.send(msg)
            } else {
                console.log('roomId对应失败，readyState对应失败')
            }
        })

    } catch (error) {
        console.error('Error:', error)
        return
    }
}

async function handle_heartbeat(ctx: FunctionContext, req: ReqBase): Promise<void> {
    const r1 = req.roomId
    //@ts-ignore
    const r2 = ctx.socket.roomId
    console.log(r1 + ":" + r2)
    if (!r2 || r1 !== r2) {
        console.log("ws::接收到前端传来心跳，然而 socket 上没有标注 roomId!!!")
        ctx.socket.close()
        return
    }

    let send: ResToFe = { responseType: "HEARTBEAT" }
    let msg: string = JSON.stringify(send)
    console.log("ws::heartbeat_send: %s", msg)
    ctx.socket.send(msg)
}

export const wss = new WebSocketServer({
    port: 8080
});

export function webSocketPlugin(): Plugin {
    return {
        name: 'webSocketPlugin',
        configureServer(server) {
            console.log('=== WebSocket 测试插件初始化开始 ===');
            if (!server.httpServer) {
                console.error('HTTP 服务器未初始化！');
                return;
            }
            console.log('WebSocket 服务器已创建');

            // 处理连接
            wss.on('connection', (ws) => {
                // 创建新的上下文，包含当前的 WebSocket 实例
                const ctx: FunctionContext = {
                    socket: ws
                };

                //@ts-ignore
                ctx.socket.createStamp = Date.now()
                let send: ResToFe = { responseType: "CONNECTED" }
                let msg: string = JSON.stringify(send)
                ctx.socket.send(msg)


                ws.on('message', async (message) => {
                    console.log("WebSocket:message..........")

                    let req = getReqObject(message)
                    console.log('WebSocket.received: %s', req)
                    let checkRes = checkReqObject(req as ReqBase)
                    if (!checkRes) {
                        ctx.socket.close()
                        return
                    }

                    let { operateType } = req as ReqBase
                    console.log('ws::operateType:', operateType)
                    if (operateType === "FIRST_SEND") {
                        await handle_first_send(ctx, req as ReqBase)
                    } else if (operateType === "SET_PLAYER") {
                        await handle_set_player(ctx, req as ReqOperatePlayer)
                    } else if (operateType === "HEARTBEAT") {
                        await handle_heartbeat(ctx, req as ReqBase)
                    }
                    return
                    //ws.send(JSON.stringify({ responseType: "CONNECTED" }))
                });

                ws.on('close', () => {
                    console.log('客户端已断开连接');
                    ctx.socket.close()
                    return
                });
            });

            console.log('WebSocket upgrade 处理器已注册');

            console.log('=== WebSocket 测试插件初始化完成 ===');
        }
    }
}

/**
 * 获取当前访问者的 guestId
 * 返回 undefined 代表访问者不在房间里
 */
function _getOperatorGuestId(clientId: string, room?: Room): string | undefined {
    if (!room) return
    let { oState, participants = [] } = room
    if (oState === "EXPIRED" || oState === "DELETED") return
    let me = participants.find(v => v.nonce === clientId)
    if (!me) return
    return me.guestId
}

function getReqObject(data: any): ReqBase | undefined {
    if (!data) return

    let req: ReqBase
    try {
        let tmpStr = data.toString()
        if (!tmpStr) return
        req = JSON.parse(tmpStr)
    }
    catch (err) {
        console.log("getReqObject 出现错误......")
        console.log(err)
        return
    }
    if (!req) return
    return req
}

function checkReqObject(data: ReqBase | ReqOperatePlayer): boolean {
    if (!data) return false
    let { operateType, roomId } = data
    let cliendId = data["x-pt-local-id"]
    let stamp = data["x-pt-stamp"]
    if (!operateType || !roomId || !cliendId || !stamp) return false
    if (operateType === "SET_PLAYER") {
        let { playStatus, speedRate, contentStamp } = data as ReqOperatePlayer
        if (!playStatus || !speedRate) return false
        if (typeof contentStamp !== "number") return false
    }

    return true
}

/**
 * 查找房间
 */
async function _getRoom(roomId: string): Promise<Room | undefined> {
    try {
        const room = await redis.get(roomId) as Room
        return room || undefined
    } catch (err) {
        console.error("获取房间信息失败：", err)
        return undefined
    }
}

/**
* 修改房间
*/
async function _updateRoom(roomId: string, data: Record<string, any>) {
    try {
        const res = await redis.set(roomId, data)
        console.log("查看一下因为播放状态 修改房间的结果........")
        console.log(res)
        console.log(" ")
        return res
    } catch (err) {
        console.log("修改房间的失败：", err)
        return undefined
    }

}