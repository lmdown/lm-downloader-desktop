import LMDGlobalEnv from "../types/LMDGlobalEnv"

// 所有AI应用，会使用这些基础的全局环境变量
export const DEFAULT_GLOBAL_ENV: LMDGlobalEnv = {

  // git安装目录，可访问git和bash命令
  GIT_INSTALL_PATH: '${LMD_DATA_ROOT}/scripts/global-tools/git/portable',
  // PIP_CACHE_DIR: '${LMD_DATA_ROOT}/scripts/cache/pip',
  HF_MIRROR: 'https://hf-mirror.com/',
  HF_HOME: '',
  // HF_HOME: '${LMD_DATA_ROOT}/scripts/global-tools/hf',
  GITHUB_PROXY: 'https://gh.llkk.cc/',
}
