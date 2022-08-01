import { onUnmounted } from "vue";

export const testWs = () => {

  console.log("import.meta.env: ")
  console.log(import.meta.env)

  const { VITE_WEBSOCKET_URL } = import.meta.env

  const ws = new WebSocket(VITE_WEBSOCKET_URL);

  ws.onopen = (socket) => {
    console.log("connected.........");
    console.log(socket)
    console.log(" ")
    ws.send("hi 这里是前端测试...");
  };
  
  ws.onmessage = (res) => {
    console.log("收到了新的消息......")
    console.log(res.data)
    console.log(res.toString())
    console.log(" ")
  };
  
  ws.onclose = () => {
    console.log("closed");
  };
  
  ws.onerror = (err) => {
    console.log("ws 出错了............")
    console.log(err)
    console.log(" ")
  }
  
  onUnmounted(() => {
    ws.close()
  })

  const closeWebSocket = () => {
    console.log("去关闭 websocket ...............")
    ws.close()
  }

  return { closeWebSocket }
}