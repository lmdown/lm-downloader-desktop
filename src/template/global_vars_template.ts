import LMDGlobalEnv from "../types/LMDGlobalEnv"

// 所有AI应用，会使用这些基础的全局环境变量
export const DEFAULT_GLOBAL_ENV: LMDGlobalEnv = {
  PYTHON_HOME:    '${LMD_DATA_ROOT}/global_tools/miniconda3/python',
  MINICONDA_DIR:  '${LMD_DATA_ROOT}/global_tools/miniconda3',
  PIP_CACHE_DIR:  '${LMD_DATA_ROOT}/global_tools/cache/pip',
  NODE_JS_DIR: '${LMD_DATA_ROOT}/node/',
  HF_MIRROR: 'https://hf-mirror.com/',
  GITHUB_PROXY: 'https://gh.llkk.cc/',
}
