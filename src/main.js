import "./overlay-plugin"
import "./ws-status"

import { insertAchieveCheckbox } from "./achieve"
import { getStore, getInstance } from "./utils"

const isDev = import.meta.env.DEV

window.addOverlayListener("LogLine", onLogLine)
window.startOverlayEvents()

const store = getStore()
const fish = store.state.fish
const fishNameToIdMap = new Map()
const fishMap = new Map()
Object.keys(fish).forEach((id) => {
  const name = store.getters.getItemName(id)
  if (name) {
    // 存在道具ID和鱼ID对不上
    // 推测道具ID取后6位就是其对应的鱼ID
    const _id = Number(id.length > 6 ? id.slice(-6) : id)

    fishNameToIdMap.set(name, _id)
    fishMap.set(_id, fish[id])
  }
})

const fishReg = /(.+?)??（(.+?)星寸）。$/

function onLogLine(data) {
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

  const id = fishNameToIdMap.get(fishName)
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

/* 成就技术添加批量设置 */
let achieveTimer
getInstance().$watch(
  "$route.path",
  function (path) {
    if (path === "/wiki") {
      function whileFind() {
        if (achieveTimer) clearTimeout(achieveTimer)

        const el = Array.from(document.querySelectorAll(".v-subheader")).find(
          (el) => el.innerText.trim() === "专研钓鱼笔记"
        )

        if (el) {
          insertAchieveCheckbox({ store, fishMap })
        } else {
          achieveTimer = setTimeout(whileFind, 1000)
        }
      }

      whileFind()
    } else {
      if (achieveTimer) clearTimeout(achieveTimer)
    }
  },
  {
    immediate: true,
  }
)
