# 任务看板（Task Board）

Trello 风格的多列卡片任务看板，纯前端实现，数据本地持久化。

## 快速开始

```bash
npm install
npm start
```

浏览器打开 <http://localhost:3000> 即可使用。

生产构建：

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 功能

- **多列管理**：新增列、编辑列名、删除空列（防止误删有卡片的列）
- **卡片 CRUD**：新增卡片（标题必填、描述选填）、编辑标题和描述、删除卡片
- **本地持久化**：所有数据自动保存到 `localStorage`，刷新不丢失
- **中文输入法兼容**：拼音组字期间不会误触发 onChange，composition 结束后才同步值

## 技术栈

- React 19
- Webpack 5（从零配置：HMR、CSS Modules、生产构建代码压缩 / CSS 提取）
- Context API + `useReducer` 做全局状态管理
- 自定义 Hooks：`useComposition`（输入法状态机）、`useBoard`（状态 + actions）
- 零测试框架：手写轻量 runner（`describe / it / expect`），无需 Jest / Vitest

## 目录结构

```
.
├── public/
│   └── index.html              # HTML 模板
├── src/
│   ├── components/             # UI 组件
│   │   ├── Board.jsx / .css    # 看板容器 + 空状态
│   │   ├── Column.jsx / .css   # 单列：标题、卡片列表、添加卡片、删除列
│   │   ├── Card.jsx / .css     # 单张卡片：编辑 / 删除
│   │   ├── Modal.jsx / .css    # 通用 Modal 弹层
│   │   └── Confirm.jsx / .css  # 通用确认对话框
│   ├── contexts/
│   │   ├── BoardContext.jsx    # Provider 定义，导出 actions + state
│   │   └── boardStorage.js     # localStorage 恢复与状态规范化（纯函数，可测）
│   ├── hooks/
│   │   ├── useBoard.js         # useReducer + boardReducer + action 封装
│   │   ├── useComposition.js   # React Hook：输入框 composition 封装
│   │   └── compositionMachine.js  # composition 状态机核心（纯逻辑，可测）
│   ├── utils/
│   │   └── id.js               # generateId() 36 进制唯一 ID
│   ├── styles/
│   │   └── global.css          # 全局样式 + CSS 变量
│   ├── App.jsx                 # 根组件
│   └── index.jsx               # React 入口
├── test/
│   ├── runner.js               # 测试运行器（describe/it/beforeEach/afterEach）
│   ├── expect.js               # 断言库（toEqual/toContain/.not 等）
│   ├── register.js             # Babel require hook（转译 JSX / ES6）
│   ├── run.js                  # 测试入口，自动发现 *.test.js
│   ├── boardReducer.test.js    # reducer 8 action + 边界
│   ├── compositionMachine.test.js  # composition 状态机
│   ├── boardStorage.test.js    # localStorage 恢复 + normalize
│   └── id.test.js              # generateId 格式 + 唯一性
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
└── babel.config.json
```

## 测试

```bash
npm test
```

手写轻量测试框架，自动扫描 `test/*.test.js`。已覆盖：

| 模块 | 用例数 | 说明 |
|---|---|---|
| `boardReducer` | 23 | 8 个 action（ADD/REMOVE/UPDATE×列和卡 + MOVE_CARD + MOVE_COLUMN），以及空列删列、跨列移动、删最后一个卡片级联清空等边界 |
| `compositionMachine` | 15 | 普通输入、拼音组字周期、多次 composition 互不干扰、setValue 强制同步、多订阅者 / 取消订阅 |
| `generateId` | 5 | 非空、长度、36 进制字符、连续 10000 次不重复、可做对象键 |
| `boardStorage` | 18 | `STORAGE_KEY`、`normalizeState`（坏输入兜底）、`restoreStateFromStorage`（空 / 坏 JSON / parse 异常 / 合法 JSON） |

## 后端

无。纯前端应用，所有数据存在浏览器 `localStorage`（key: `task-board-state`），无需任何服务端。
