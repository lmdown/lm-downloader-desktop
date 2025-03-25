export default interface UpdateIndexData {

  version: string

  desktop_app: {
    min_version: string
  }

  story_packages: {
    main_pack_file_name: string
    main_pack_prefix: string
  }

  frontend: {
    path: string
    depencencies: string[]
  }

  server: {
    path: string
    depencencies: string[]
  }

  ai_apps: {
    depencencies: AIAppDepts
  }

}

export interface AIAppDepts {
  sevenz_url: string
  git_file_name: string
  git_file_prefix: string
}
