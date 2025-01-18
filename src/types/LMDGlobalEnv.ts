import LMDEnv from "./LMDEnv"

export default interface  LMDGlobalEnv extends LMDEnv {
  //
  // MINICONDA_DIR: string
  //
  // PYTHON_HOME: string

  // PIP_CACHE_DIR: string
  //
  HF_MIRROR: string
  //
  GITHUB_PROXY: string
  //
  NODE_JS_DIR: string
}
