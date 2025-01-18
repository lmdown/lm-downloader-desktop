# 魔当桌面客户端 (LM Downloader Desktop)

魔当是一个免费，开源，易上手，且功能强大的AI大模型软件下载工具。

- 对于想在自己电脑上运行大模型的人，欢迎下载使用。
- 如果你是开发者，也欢迎提出意见和贡献代码，完善此工具。
- 如果你开发过大模型应用，可以提交到魔当社区，让更多人能快速下载和使用。

[English](./README.md) · 中文

## Download

- [下载 最新版魔当](https://gitee.com/lmdown/lm-downloader-desktop/releases)

## 推荐的开发工具

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## 项目运行
本仓库是魔当的桌面客户端，使用Electron and TypeScript开发。

### 安装依赖

```bash
$ npm install
```

### 本地运行

```bash
$ npm run dev
```

### 构建

```bash
# 跳过签名
export CSC_IDENTITY_AUTO_DISCOVERY=false

# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 完整架构

以下是整个项目的架构图：

<img width="220" src="docs/Architecture.png">

## 🔗 链接

- [LM Downloader Desktop](https://gitee.com/lmdown/lm-downloader-desktop)
- [LM Downloader Frontend](https://gitee.com/lmdown/lm-downloader-frontend)
- [LM Downloader Local Server](https://gitee.com/lmdown/lm-downloader-local-server)
- [LM Downloader App Story](https://gitee.com/lmdown/lm-downloader-app-story)
- [LMD Install Scripts](https://gitee.com/lmdown/lm-downloader-app-story)

