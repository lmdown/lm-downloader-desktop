// 启动时用默认模板，生成配置文件，存到LMD_DATA_ROOT下面
// 如果用户修改了根目录，此配置变更，其他文件会保存到新的根目录下。

import LMDBaseConfig from "../types/LMDBaseConfig"

export const DEFAULT_LMD_BASE_CONFIG: LMDBaseConfig = {
  // 配置，数据，AI应用，模型等所有文件的根目录
  LMD_DATA_ROOT: "${documents}/lmd_data_root",
  // 环境初始化的目录
  LMD_ENV_INIT_DIR: "${LMD_DATA_ROOT}/env-init",
  // 应用安装和管理脚本的目录
  LMD_SCRIPTS_DIR: "${LMD_DATA_ROOT}/scripts",
  // 应用安装的目录
  LMD_APPS_DIR: "${LMD_DATA_ROOT}/apps",

  LMD_LOCALE: "",

  GLOBAL_TOOLS_DIR: '${LMD_DATA_ROOT}/scripts/global-tools',
  // git安装目录，可访问git和bash命令
  GIT_INSTALL_PATH: '${LMD_DATA_ROOT}/scripts/global-tools/git/portable',

  LMD_APP_STORY_GIT: "https://gitee.com/lmdown/lm-downloader-app-story",

  LMD_APP_STORY_DIR: "${LMD_DATA_ROOT}/scripts/lm-downloader-app-story",

  LMD_FRONTEND_DIST_DIR: "${LMD_DATA_ROOT}/scripts/lm-downloader-app-story/frontend/index.html",

}

