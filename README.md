<h1 align="center">YuleHub</h1>

## 项目简介

YuleHub是一个基于现代 Web 技术构建的实时聊天应用，提供智能化、个性化的聊天体验。支持 **用户 与 AI** 进行角色扮演进行**无限制**聊天，并提供了 _PC 端_ 和 _移动端_ 的响应式界面及功能模块。同时，已新增YULE插画和YULE小说(需翻墙)分区。

### AI聊天页面

<table>
  <tr>
    <td><img src="public/readMe/chat-pc1.png"/></td>
    <td><img src="public/readMe/chat-mobile.png" width="670px"/></td>
  </tr>
</table>

### 插画页面

<table>
  <tr>
    <td><img src="public/readMe/comics_pc_category_light.png"/></td>
    <td><img src="public/readMe/comics_phone_category_light.png" width="800px"/></td>
  </tr>
  <tr>
    <td><img src="public/readMe/comics_pc_category_dark.png" /></td>
    <td><img src="public/readMe/comics_phone_detail_dark.png" width="800px"/></td>
  </tr>
</table>

### 小说页面

<table>
  <tr>
    <td><img src="public/readMe/novel_pc_light_home.png"/></td>
    <td><img src="public/readMe/novel_phone_light_detail.png" width="800px"/></td>
  </tr>
  <tr>
    <td><img src="public/readMe/novel_pc_dark_home.png" /></td>
    <td><img src="public/readMe/novel_phone_dark_category.png" width="800px"/></td>
  </tr>
</table>

## 核心功能

1. **AI聊天**：

   - 接入 **DZMM** 平台提供API 可自定义创建角色卡进行对话。
   - 提供消息展示和推送功能。
   - 首次聊天需去DZMM网站(需翻墙)去获取Token(DZMM对于特定模型每日赠送50次免费调用，可注册多个账号填入token)
   - 获取Token之后再无需翻墙

2. **多媒体支持**：

   - 接入 **MINIMAX** 语音模型播放智能体对话内容。
   - 提供音频静音、播放功能。

3. **YULE插画**：

   - [https://image.anosu.top](https://image.anosu.top)API提供
   - 展示Pixiv精选图片(可选择是否开启NSFW)

4. **YULE小说(需翻墙)**
   - [https://hibiapi.getloli.com](https://hibiapi.getloli.com/docs)API提供
   - 接入pixiv小说接口,可进行搜索

## 安装项目

1. **克隆项目**

   ```bash
   git clone https://github.com/yule-wazi/YuleHub.git
   ```

2. **进入项目目录**

   ```bash
   cd AI聊天室
   ```

3. **安装依赖**

   ```bash
   npm install
   ```

4. **运行项目**

   ```bash
   npm run dev
   ```

5. **访问项目**

   - 在浏览器中打开 [http://localhost:5173](http://localhost:5173) 查看项目。

6. **登录账号**
   - 账号：`vip` 密码：`vip`

## 技术栈

1. **前端**：

   - **Vue.js**：用于构建用户界面，组件化开发。
   - **CSS**：通过 `common.css`、`index.css` 和 `root.css` 实现样式管理。
   - **Vite**：作为开发和构建工具，提供快速的热更新和高效的打包。

2. **后端**：

   - **Express.js**：用于处理 API 请求和后端逻辑。
   - **Node.js**：作为后端运行环境。

## 源码仓库

- GitHub仓库 [点击进入](https://github.com/yule-wazi/aiChat.git)
- Gitee仓库 [点击进入](https://gitee.com/yule-wazi/ai-chat-room.git)
