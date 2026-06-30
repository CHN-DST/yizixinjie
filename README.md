<p align="center">
  <img src="screenshots/logo.png" width="120" alt="一字心解 Logo" />
</p>

<h1 align="center">一字心解</h1>
<p align="center">
  <strong>言为心声，字为心画 — 心形运笔，笔画藏休咎</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0-blue?style=flat-square" alt="Version 0.4.0" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/platform-Web%20%7C%20Mobile-orange?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
</p>

<p align="center">
  <a href="https://yizixinjie.pages.dev"><strong>🌐 在线体验</strong></a> ·
  <a href="#-项目简介"><strong>📖 项目简介</strong></a> ·
  <a href="#-功能特性"><strong>✨ 功能特性</strong></a> ·
  <a href="#-技术架构"><strong>🏗 技术架构</strong></a> ·
  <a href="#-快速开始"><strong>🚀 快速开始</strong></a>
</p>

---

## 📖 项目简介

**一字心解**是一款融合 DeepSeek AI 与中国古代测字术的 Web 应用。AI 深谙《测字秘牒》九法（装头/接脚/穿心/破解/添笔/减笔/对关/摘字/观梅），结合六书六义、五行六神、心易心法，从**字源学**、**文化学**、**字相学**三个维度进行深度解析。

> 字从太极出，各具首尾，各有结构。因其所示之事而推之，据吾所触之几而断之。——《测字秘牒》

### 🎯 核心理念

汉字是中华文明的基因密码。一字心解通过现代 AI 技术，让古老的**测字术**焕发新生，帮助用户通过一个汉字洞察自我、寻找方向。

### 📚 AI 知识来源

AI Prompt 深度参考以下古籍经典：

| 古籍 | 朝代/作者 | 贡献 |
|------|-----------|------|
| 《测字秘牒》 | 清 · 程省 | 测字九法体系（装头/接脚/穿心/破解/添笔/减笔/对关/摘字/观梅） |
| 《新刻相字心法》 | 明 · 仲 | 相字秘传心法，字之体用笔画吉凶 |
| 《字触》 | 清 · 周工亮 | 历代测字案例，以字触机 |
| 《梅花易数》 | 宋 · 邵康节 | 邵子观梅心诀，万物借来应用 |
| 《渊海子平》 | 宋 · 徐大升 | 五行生克、六神配位体系 |
| 《说文解字》 | 东汉 · 许慎 | 汉字字源学奠基之作 |
| 《测字解密》 | 蔡大成 | 古今测字一千六百例 |

---

## ✨ 功能特性

### 🎬 开屏动画
- Canvas 毛笔书法动画：「言为心声，字为心画。心形运笔，笔画藏休咎。」
- 逐字揭示、墨粒子飞白、宣纸纹理、毛笔光标
- 首次访问展示，localStorage 记忆

### 🔮 智能测字
- **AI 深度解析**：基于 DeepSeek 大模型，融入古籍测字心法
- **测字九法**：装头、接脚、穿心、破解、添笔、减笔、对关、摘字、观梅
- **五行六神**：每个汉字自动判断五行归属与六神临位

### 💬 个性化提问
- 用户可自定义人生困惑，AI 结合汉字意象与问题生成个性化解读
- 每条建议关联字之拆解，具体可操作

### 🎨 现代东方极简设计
- 宣纸白底色、墨灰文字、鎏金点缀、朱砂强调
- 克制留白、呼吸感排版，自适应移动端与桌面端

### 📊 使用管理
- 每日免费 2 次，密钥解锁 10 次/天
- 密钥基于 SHA-256 动态生成，每日自动轮换
- 隐藏密钥支持无限次使用

### 🗄 数据存储
- Supabase PostgreSQL 数据库记录测字历史
- 后台管理系统查看所有记录

### 🔗 分享功能
- 生成精美海报卡片，一键保存为 PNG

---

## 🎬 页面预览

| 开屏动画 | 首页 |
|:---:|:---:|
| <img src="screenshots/splash.png" width="100%" alt="开屏动画" /> | <img src="screenshots/home.png" width="100%" alt="首页" /> |

| 测字输入 | 结果分析 |
|:---:|:---:|
| <img src="screenshots/input.png" width="100%" alt="测字输入" /> | <img src="screenshots/result.png" width="100%" alt="结果分析" /> |

| 历史记录 | 关于页面 |
|:---:|:---:|
| <img src="screenshots/history.png" width="100%" alt="历史记录" /> | <img src="screenshots/about.png" width="100%" alt="关于页面" /> |

---

## 🏗 技术架构

```
┌──────────────────────────────────────────────────────┐
│                   用户浏览器                           │
│            https://yizixinjie.pages.dev               │
└────────────┬──────────────────────────┬──────────────┘
             │  Cloudflare Pages       │  HTTPS
             │  前端 SPA (Vue 3)        │  POST /analyze
             ▼                          ▼
┌────────────────────┐   ┌──────────────────────────────┐
│   Cloudflare CDN    │   │      腾讯云 SCF (广州)         │
│   Vue 3 + Vite      │   │   Node.js 18  Serverless     │
│   Vant 4 UI 组件库   │   │                              │
│   Canvas 毛笔动画    │   │   ├─ /analyze → DeepSeek API │
│   现代东方极简主题    │   │   ├─ /key     → 密钥验证      │
│                     │   │   └─ /admin   → 后台管理      │
└────────────────────┘   └──────────────┬───────────────┘
                                        │ HTTPS
                                        ▼
                           ┌──────────────────────────────┐
                           │       DeepSeek API            │
                           │   deepseek-chat 模型          │
                           │   古籍测字心法 Prompt 工程     │
                           └──────────────────────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────────┐
                           │    Supabase (PostgreSQL)      │
                           │   测字记录持久化存储           │
                           └──────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 🖥 前端框架 | Vue 3 + Vite | SPA 单页应用 |
| 🎨 UI 组件 | Vant 4 | 移动端优先组件库 |
| 🎬 动画 | Canvas API | 开屏毛笔书写动画 |
| 📦 状态管理 | Pinia | 轻量级状态管理 |
| 🗺 路由 | Vue Router 4 | History 模式路由 |
| 🌐 前端部署 | Cloudflare Pages | 全球 CDN |
| ⚡ 后端计算 | 腾讯云 SCF | Serverless 函数 |
| 🤖 AI 引擎 | DeepSeek API | 古籍 Prompt 工程 |
| 🗄 数据库 | Supabase | PostgreSQL 云数据库 |
| 🔐 密钥系统 | SHA-256 哈希 | 每日自动轮换 |

### 项目结构

```
yizixinjie/
├── frontend/                    # Vue 3 前端
│   ├── src/
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home.vue         # 首页
│   │   │   ├── Camera.vue       # 测字输入页
│   │   │   ├── Result.vue       # 结果展示页
│   │   │   ├── History.vue      # 历史记录页
│   │   │   ├── About.vue        # 关于页
│   │   │   └── Admin.vue        # 后台管理页
│   │   ├── components/          # 可复用组件
│   │   │   └── common/
│   │   │       ├── SplashScreen.vue  # Canvas 毛笔开屏
│   │   │       └── SharePoster.vue   # 分享海报
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── services/            # API 调用层
│   │   ├── utils/               # 工具函数
│   │   └── styles/              # 现代东方极简主题
│   ├── public/                  # 静态资源
│   └── index.html               # HTML 入口
├── scf/                         # 腾讯云 SCF 函数
│   ├── index.js                 # 函数主入口（含古籍 Prompt）
│   ├── deploy.js                # 自动部署脚本
│   └── public/                  # 内嵌前端静态文件
├── 参考文献/                     # 古籍参考文献
│   ├── 测字秘传心法.pdf
│   ├── 新刻相字心法.pdf
│   ├── 字触.pdf
│   ├── 梅花易数.epub
│   ├── 渊海子平.txt
│   ├── 说文解字.pdf
│   └── 测字解密.pdf
├── screenshots/                 # 项目截图
└── README.md                    # 项目说明
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.x
- 腾讯云账号（用于部署 SCF）
- Cloudflare 账号（用于部署前端）
- DeepSeek API Key（[申请地址](https://platform.deepseek.com)）

### 本地开发

```bash
# 克隆项目
git clone https://github.com/CHN-DST/yizixinjie.git
cd yizixinjie

# 启动前端开发服务器
cd frontend
npm install && npm run dev
```

### 一键部署

```bash
# 构建前端并复制到 SCF
cd frontend
npm run build
cp -r dist ../scf/public

# 部署 SCF 函数（需设置腾讯云凭证）
cd ../scf
export TENCENT_SECRET_ID=your_id
export TENCENT_SECRET_KEY=your_key
node deploy.js

# 部署前端到 Cloudflare Pages
cd ../frontend
export CLOUDFLARE_API_TOKEN=your_token
npx wrangler pages deploy dist --project-name=yizixinjie
```

---

## 📝 更新日志

### v0.4.0 (2026-06-30)

- 🎬 **Canvas 毛笔开屏动画**：逐字揭示、墨粒子飞白、宣纸纹理、毛笔光标
- 📜 **古籍 Prompt 升级**：融入《测字秘牒》完整九法 + 六书六义 + 五行六神 + 心易心法
- 📚 **参考文献扩充**：新增《字触》《梅花易数》《相字心法》《渊海子平》《说文解字》《测字解密》
- 🔧 修复 localStorage 重复播放、T_WRITE_START 报错、Google Fonts 国内超时
- 🏗 SCF + Cloudflare Pages 双栈部署稳定

### v0.3.0 (2026-06-09)

- 🎨 **现代东方极简 UI 重设计**：宣纸白 · 墨灰 · 鎏金 · 朱砂配色系统
- 🏠 首页重设计：极简 Hero + 汉字输入 + 今日解字模块
- 📄 结果页升级：折叠面板、赠言展示、结果展开动画
- 🖼 分享海报：Canvas 绘制精美分享卡片，一键保存 PNG
- 📖 关于页：技术架构、参考古籍、GitHub 开源信息
- 🗄 Supabase 数据库记录测字历史
- 🔧 后台管理系统（`/admin`）
- 🔑 隐藏密钥无限次使用支持
- ⚡ CSS 体积优化 67%，去除全量 Vant CSS

### v0.2.0 (2026-06-04)

- 🎨 古风化 UI 设计（兰亭序底纹、宣纸卡片、朱砂印章按钮）
- 🔮 融入《测字秘牒》心法（装头/接脚/穿心/破解/对关/五行六神）
- 🔑 每日密钥系统（SHA-256 动态生成）
- 🏗 全自动部署（SCF API + Cloudflare wrangler）

### v0.1.0 (2026-06-02)

- 🎉 初始版本发布
- 🔍 DeepSeek AI 测字分析
- ✏️ 直接输入汉字 + 自定义提问
- 📋 历史记录（本地存储）

---

## 📄 许可证

[MIT License](LICENSE) © 2026 一字心解

---

<p align="center">
  <i>言为心声，字为心画。心形运笔，笔画藏休咎。</i>
</p>
