# FF14 鱼糕增强插件
**Tampermonkey**(油猴/篡改猴) 的脚本，为**鱼糕网页版**增加自动标记已完成的功能。

## 使用方法
### 安装
1. 安装 **Tampermonkey**，安装方法见 [Tampermonkey 官网](https://www.tampermonkey.net/)
1. 打开 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/473716)
2. 点击安装此脚本

### 连接ACT
需为ACT安装上**悬浮窗插件**。

1. 打开ACT - 插件 - 悬浮窗WS服务
2. 记录 **IP 地址** 与 **端口**
3. 拼接地址 `https://fish.ffmomola.com/#/?OVERLAY_WS=[IP 地址]:[端口号]/ws`
4. 打开拼接后的地址

> 拼接完应为 [https://fish.ffmomola.com/#/?OVERLAY_WS=ws://127.0.0.1:10501/ws](https://fish.ffmomola.com/#/?OVERLAY_WS=ws://127.0.0.1:10501/ws)

若你的 **IP 地址** 与 **端口** 分别为 `127.0.0.1` 和 `10501`，则可不拼接参数直接访问 `https://fish.ffmomola.com/`。

当左上角鱼糕的LOGO旁出现 __ACT 已连接__ 则表示连接成功。

## 对页面的修改
插件会对网页内容做一定的修改，下面将列出修改的内容，以便于区分。

### LOGO 右侧
在页面左上角 LOGO 右侧会添加 `ACT 已连接` 的标签，以表示已连接上ACT。

### 成就计数
在钓鱼笔记 - 成就计数中，成就的标题旁添加了 `标记为已获得` 按钮，点击后会将该成就所有鱼王都设置为已获得。
