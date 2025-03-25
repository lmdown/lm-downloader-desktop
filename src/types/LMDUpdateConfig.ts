export default interface LMDUpdateConfig {

  // story.zip, includes: db, env, ghp.json, story-assets, update_index.json
  //
  LMD_APP_STORY_PACKAGE: string

  // frontend_app.zip
  // frontend_libs.zip
  // frontend_images.zip
  FRONTEND_APP_PACKAGE: string
  FRONTEND_LIB_PACKAGE: string
  FRONTEND_IMAGES_PACKAGE: string

  // server_app.zip
  SERVER_PACKAGE: string

}
