export function insertAchieveCheckbox({ store, fishMap }) {
  const achieveMap = {
    愿者上钩: [],
    净界太公: [],
    太公仙路: [],
    晓月太公: [],
  }
  store.state.bigFish.forEach((id) => {
    const fish = fishMap.get(id)
    if (!fish) {
      console.debug("[Log 未找到鱼王]", id)
      return
    }

    if (fish.patch < 5) {
      achieveMap["愿者上钩"].push(id)
      achieveMap["太公仙路"].push(id)
    }

    if (fish.patch >= 5 && fish.patch < 6) {
      achieveMap["净界太公"].push(id)
      achieveMap["太公仙路"].push(id)
    }

    if (fish.patch >= 6 && fish.patch < 7) {
      achieveMap["晓月太公"].push(id)
    }
  })

  Array.from(document.querySelectorAll(".v-subheader")).forEach((el) => {
    const title = el.innerText.trim()
    if (!(title in achieveMap)) return

    const button = document.createElement("button")
    el.appendChild(button)

    button.innerHTML = '标记为已获得'
    button.title = '将该成就下所有鱼王标记为已获得'

    // 设置button的样式，有边框有背景有颜色
    button.style.border = '1px solid #979797'
    button.style.borderRadius = '4px'
    button.style.background = 'rgba(128, 128, 128, 0.5)'
    button.style.marginLeft = '20px'
    button.style.padding = '0 4px'
    

    button.addEventListener("click", () => {
      store.commit("batchSetFishCompleted", {
        fishIds: achieveMap[title],
        completed: true,
      })
    })
  })
}
