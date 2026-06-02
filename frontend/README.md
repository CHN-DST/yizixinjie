# 一字心解 - 前端

基于 Vue3 + Vite + Vant 的移动端汉字分析应用。

## 目录说明

```
frontend/
├── index.html                     # HTML 入口
├── vite.config.js                 # Vite 配置
├── src/
│   ├── main.js                    # 应用入口
│   ├── App.vue                    # 根组件
│   ├── router/index.js            # 路由配置
│   ├── stores/
│   │   └── charStore.js           # 汉字数据状态管理
│   ├── services/
│   │   ├── api.js                 # Axios 实例
│   │   ├── charService.js         # 分析 API
│   │   └── uploadService.js       # 上传 API
│   ├── pages/
│   │   ├── Home.vue               # 首页
│   │   ├── Camera.vue             # 拍照页
│   │   ├── Result.vue             # 结果页
│   │   ├── History.vue            # 历史记录
│   │   └── About.vue              # 关于页
│   ├── components/
│   │   ├── common/                # 通用组件
│   │   ├── camera/                # 拍照组件
│   │   └── result/                # 结果组件
│   ├── utils/                     # 工具函数
│   └── styles/                    # 全局样式
```

## Quick Start

```bash
cp .env.example .env.local
# 按需修改 VITE_API_BASE_URL
npm install
npm run dev
```

## 构建部署

```bash
npm run build   # 输出到 dist/
npm run preview # 预览构建结果
```
