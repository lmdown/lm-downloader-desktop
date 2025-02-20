import LMDEnv from "./LMDEnv"

export default interface  LMDGlobalEnv extends LMDEnv {
  //
  // MINICONDA_DIR: string
  //
  // PYTHON_HOME: string

  // PIP_CACHE_DIR: string
  //
  HF_MIRROR: string

  HF_HOME: string

  //
  GITHUB_PROXY: string
  //
  // NODE_JS_DIR: string

  // git安装目录，可访问git和bash命令
  GIT_INSTALL_PATH: string

}
