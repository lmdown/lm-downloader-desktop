# LM Downloader Desktop (魔当)

LM Downloader is a free, open source, easy-to-use, and powerful AI Large Model Apps downloading tool. Welcome to contribute code.

- For users who want to run the LLM apps on their own computer, you are welcome to download and use it.
- If you are a developer, Comments and contributions to improve the tool are also welcome.
- If you've developed LLM Apps, you can submit it to our community so that more people can quickly download and use it.

English · [中文](./README-zh.md)

## 🔗 Links
- [LM Downloader Homepage](https://daiyl.com)
- [Get latest LM Downloader](https://gitee.com/lmdown/lm-downloader-desktop/releases)

## Snapshots

#### On the homepage of LM Downloader, you can see various types of Large Model Apps.

<img width="220" src="docs/en/lm-downloader-home-en.jpg">

#### View the introduction of the App, and click Install.

<img width="220" src="docs/en/chatbox-install-en.jpg">

#### If Ollama is installed, you can change settings, and choose the models you want to download. Do it all without having to enter commands.

<img width="220" src="docs/en/ollama-running-c.png">

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Project Setup

This repository is the desktop app with Electron and TypeScript.

### Install

```bash
npm install
```

### Development

Please open ```.env```. If you want to run this program quickly, edit this file; if you want to fully debug all functions, you don't need to modify it.

```bash
# Frontend - Local Vite Server.
# VITE_DEV_SERVER_URL=http://localhost:5173
# Launch by electron main process
START_LMD_SERVER=1
# Update App Story files from git repo
UPDATE_STORY=0
```

Run this app.
```bash
npm run dev
```

### Build

```bash
# skip application code signing
export CSC_IDENTITY_AUTO_DISCOVERY=false

# For windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

## LM Downloader Full Architecture

Below is the architecture diagram of the entire project:

<img width="220" src="docs/Architecture.png">

## 🔗 Git Repository Links

- [LM Downloader Desktop](https://gitee.com/lmdown/lm-downloader-desktop)
- [LM Downloader Frontend](https://gitee.com/lmdown/lm-downloader-frontend)
- [LM Downloader Local Server](https://gitee.com/lmdown/lm-downloader-local-server)
- [LM Downloader App Story](https://gitee.com/lmdown/lm-downloader-app-story)
- [LMD Install Scripts](https://gitee.com/lmdown/lm-downloader-app-story)


## License

This project is licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0). Copyright © 2025 lmdown

This project is licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "as is" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language that governs permissions and
limitations under the License.


## Professional Version

Our software's professional version is a premium version meticulously crafted for users who pursue outstanding performance and ultimate experience. It features numerous powerful functions that are not available in the open-source version and can significantly enhance your work and business.

**The professional version features**
- Advanced Data Analysis Capabilities.
- Customization Options.
- Automated Task Handling.

In addition to its powerful features, our professional version also provides comprehensive customer support services:
- Dedicated Customer Service Team.
- Priority Response Service.
- Technical Training and Guidance.
- Continuous Updates and Upgrades.
