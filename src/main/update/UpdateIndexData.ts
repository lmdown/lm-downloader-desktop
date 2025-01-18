export default interface UpdateIndexData {

  desktop_app: {
    min_version: string
  }

  frontend: {
    path: string
    depencencies: string[]
  }

  server: {
    path: string
    depencencies: string[]
  }

}
