let tagRef

window.addOverlayListener("open", () => {
  if (tagRef) return

  const contentRef = document.querySelector(".v-toolbar__content")

  const titleRef = document.querySelector(".v-toolbar__title")
  tagRef = document.createElement("div")

  contentRef.insertBefore(tagRef, titleRef.nextElementSibling)

  tagRef.innerHTML = `
  <span class="v-badge v-badge--inline theme--dark">
    <span class="v-badge__wrapper">
      <span
        role="status"
        class="v-badge__badge primary"
        >ACT 已连接</span
      >
    </span>
  </span>
  `
})
window.addOverlayListener("close", () => {
  if (!tagRef) return

  const contentRef = document.querySelector(".v-toolbar__content")
  contentRef.removeChild(tagRef)

  tagRef = undefined
})
