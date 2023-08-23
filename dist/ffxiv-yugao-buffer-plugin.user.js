// ==UserScript==
// @name         FF14 鱼糕增强插件
// @namespace    ffxiv-yugao-buffer-plugin
// @version      1.0.1
// @author       毛呆
// @description  为鱼糕网页版增加自动标记已完成的功能。
// @license      MIT
// @match        https://fish.ffmomola.com/*
// ==/UserScript==

(function () {
  'use strict';

  (function() {
    let wsUrl = /[\?&]OVERLAY_WS=([^&]+)/.exec(location.href);
    let ws = null;
    let queue = [];
    let rseqCounter = 0;
    let responsePromises = {};
    let subscribers = {};
    let sendMessage = null;
    let eventsStarted = false;
    if (!wsUrl) {
      wsUrl = [
        "?OVERLAY_WS=ws://127.0.0.1:10501/ws",
        "ws://127.0.0.1:10501/ws"
      ];
    }
    if (wsUrl) {
      let connectWs2 = function() {
        ws = new WebSocket(wsUrl[1]);
        ws.addEventListener("error", (e) => {
          console.error(e);
        });
        ws.addEventListener("open", () => {
          console.log("Connected!");
          processEvent({ type: "open" });
          let q = queue;
          queue = null;
          for (let msg of q)
            sendMessage(msg);
        });
        ws.addEventListener("message", (msg) => {
          try {
            msg = JSON.parse(msg.data);
          } catch (e) {
            console.error("Invalid message received: ", msg);
            return;
          }
          if (msg.rseq !== void 0 && responsePromises[msg.rseq]) {
            responsePromises[msg.rseq](msg);
            delete responsePromises[msg.rseq];
          } else {
            processEvent(msg);
          }
        });
        ws.addEventListener("close", () => {
          processEvent({ type: "close" });
          queue = [];
          console.log("Trying to reconnect...");
          setTimeout(() => {
            connectWs2();
          }, 300);
        });
      };
      sendMessage = (obj) => {
        if (queue)
          queue.push(obj);
        else
          ws.send(JSON.stringify(obj));
      };
      connectWs2();
    } else {
      let waitForApi2 = function() {
        if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
          setTimeout(waitForApi2, 300);
          return;
        }
        let q = queue;
        queue = null;
        window.__OverlayCallback = processEvent;
        for (let [msg, resolve] of q)
          sendMessage(msg, resolve);
      };
      sendMessage = (obj, cb) => {
        if (queue)
          queue.push([obj, cb]);
        else
          OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
      };
      waitForApi2();
    }
    function processEvent(msg) {
      if (subscribers[msg.type]) {
        for (let sub of subscribers[msg.type])
          sub(msg);
      }
    }
    window.dispatchOverlayEvent = processEvent;
    window.addOverlayListener = (event, cb) => {
      if (eventsStarted && subscribers[event]) {
        console.warn(`A new listener for ${event} has been registered after event transmission has already begun.
Some events might have been missed and no cached values will be transmitted.
Please register your listeners before calling startOverlayEvents().`);
      }
      if (!subscribers[event]) {
        subscribers[event] = [];
      }
      subscribers[event].push(cb);
    };
    window.removeOverlayListener = (event, cb) => {
      if (subscribers[event]) {
        let list = subscribers[event];
        let pos = list.indexOf(cb);
        if (pos > -1)
          list.splice(pos, 1);
      }
    };
    window.callOverlayHandler = (msg) => {
      let p;
      if (ws) {
        msg.rseq = rseqCounter++;
        p = new Promise((resolve) => {
          responsePromises[msg.rseq] = resolve;
        });
        sendMessage(msg);
      } else {
        p = new Promise((resolve) => {
          sendMessage(msg, (data) => {
            resolve(data == null ? null : JSON.parse(data));
          });
        });
      }
      return p;
    };
    window.startOverlayEvents = () => {
      eventsStarted = false;
      sendMessage({
        call: "subscribe",
        events: Object.keys(subscribers)
      });
    };
  })();
  let tagRef;
  window.addOverlayListener("open", () => {
    if (tagRef)
      return;
    const contentRef = document.querySelector(".v-toolbar__content");
    const titleRef = document.querySelector(".v-toolbar__title");
    tagRef = document.createElement("div");
    contentRef.insertBefore(tagRef, titleRef.nextElementSibling);
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
  `;
  });
  window.addOverlayListener("close", () => {
    if (!tagRef)
      return;
    const contentRef = document.querySelector(".v-toolbar__content");
    contentRef.removeChild(tagRef);
    tagRef = void 0;
  });
  window.addOverlayListener("LogLine", onLogLine);
  window.startOverlayEvents();
  const store = getStore();
  const fish = store.state.fish;
  const fishMap = /* @__PURE__ */ new Map();
  Object.keys(fish).forEach((id) => {
    const name = store.getters.getItemName(id);
    if (name) {
      const _id = id.length > 6 ? id.slice(-6) : id;
      fishMap.set(name, Number(_id));
    }
  });
  const fishReg = /成功钓上了(.+?)??（(.+)）。$/;
  function onLogLine(data) {
    const { type, line, rawLine } = data;
    if (type !== "LogLine")
      return;
    if (!Array.isArray(line))
      return;
    const [logType, timestamp, code, name, message] = line;
    if (logType !== "00")
      return;
    if (name)
      return;
    const match = message.match(fishReg);
    if (!match) {
      return;
    }
    const [, fishName] = match;
    console.log(`成功钓上了 ${fishName}`);
    const id = fishMap.get(fishName);
    if (!id) {
      return;
    }
    store.commit("setFishCompleted", {
      fishId: id,
      completed: true
    });
  }
  function getStore() {
    const app = document.getElementById("app");
    const instance = app.__vue__;
    return instance.$store;
  }

})();
