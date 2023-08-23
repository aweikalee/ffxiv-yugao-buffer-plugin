import "./overlay-plugin"
import './ws-status'

const isDev = import.meta.env.DEV

window.addOverlayListener("LogLine", onLogLine)
window.startOverlayEvents()

const store = getStore()
const fish = store.state.fish
const fishMap = new Map()
Object.keys(fish).forEach((id) => {
  const name = store.getters.getItemName(id)
  if (name) {
    // 存在道具ID和鱼ID对不上
    // 推测道具ID取后6位就是其对应的鱼ID
    const _id = id.length > 6 ? id.slice(-6) : id
    fishMap.set(name, Number(_id))
  }
})

const fishReg = /成功钓上了(.+?)?（(.+)）。$/

function onLogLine(data) {
  console.log(data)
  const { type, line, rawLine } = data
  if (type !== "LogLine") return
  if (!Array.isArray(line)) return

  const [logType, timestamp, code, name, message] = line

  if (logType !== "00") return
  if (name) return // 必须是匿名消息

  const match = message.match(fishReg)
  if (!match) {
    if (isDev) console.debug("[Log 系统消息]", rawLine)
    return
  }

  const [, fishName] = match
  console.log(`成功钓上了 ${fishName}`)

  const id = fishMap.get(fishName)
  if (!id) {
    if (isDev) console.debug("[Log 未找到ID]", fishName, rawLine)
    return
  }

  if (isDev) {
    if (!store.state.userData.completed.includes(Number(id))) {
      console.debug("[Log 新增]", fishName, `(${id})`, rawLine)
    }
  }

  store.commit("setFishCompleted", {
    fishId: id,
    completed: true,
  })
}

function getStore() {
  const app = document.getElementById("app")
  const instance = app.__vue__
  return instance.$store
}
