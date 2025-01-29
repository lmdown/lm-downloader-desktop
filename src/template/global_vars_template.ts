import LMDGlobalEnv from "../types/LMDGlobalEnv"

// 所有AI应用，会使用这些基础的全局环境变量
export const DEFAULT_GLOBAL_ENV: LMDGlobalEnv = {
  NODE_JS_DIR: '${LMD_DATA_ROOT}/node/',
  // git安装目录，可访问git和bash命令
  GIT_INSTALL_PATH: '${LMD_DATA_ROOT}/scripts/global-tools/git/portable',
  HF_MIRROR: 'https://hf-mirror.com/',
  GITHUB_PROXY: 'https://gh.llkk.cc/',
}
