# LM Downloader Desktop (魔当)

LM Downloader is a free, open source, easy-to-use, and powerful AI Large Model Apps downloading tool. Welcome to contribute code.

- For users who want to run the LLM apps on their own computer, you are welcome to download and use it.
- If you are a developer, Comments and contributions to improve the tool are also welcome.
- If you've developed LLM Apps, you can submit it to our community so that more people can quickly download and use it.

English · [中文](./README-zh.md)

## Download

- [Get latest LM Downloader](https://gitee.com/lmdown/lm-downloader-desktop/releases)

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Project Setup

This repository is the desktop app with Electron and TypeScript.

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# skip application code signing
export CSC_IDENTITY_AUTO_DISCOVERY=false

# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## LM Downloader Full Architecture

Below is the architecture diagram of the entire project:

<img width="220" src="docs/Architecture.png">

## 🔗 Links

- [LM Downloader Desktop](https://gitee.com/lmdown/lm-downloader-desktop)
- [LM Downloader Frontend](https://gitee.com/lmdown/lm-downloader-frontend)
- [LM Downloader Local Server](https://gitee.com/lmdown/lm-downloader-local-server)
- [LM Downloader App Story](https://gitee.com/lmdown/lm-downloader-app-story)
- [LMD Install Scripts](https://gitee.com/lmdown/lm-downloader-app-story)
