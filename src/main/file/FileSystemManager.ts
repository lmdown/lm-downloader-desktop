import { dialog, ipcMain } from 'electron'
import { IPCHandleName } from '../../constant/IPCHandleName'
import fs from 'fs'
import DirInfo from '../../types/DirInfo'

/**
 * Open folder , select folder
 */
export default class FileSystemManager {
  static instance

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager()
    }
    return FileSystemManager.instance
  }

  constructor() {}

  init() {
    this.initHandlers()
  }

  initHandlers() {
    ipcMain.handle(
      IPCHandleName.SELECT_DIR,
      async (event, defaultPath: string, needSubItems: boolean = false) => {
        const result = await dialog.showOpenDialog({
          defaultPath: defaultPath,
          properties: ['openDirectory']
        })
        if (!result.canceled) {
          const firstPath = result.filePaths[0]
          const dirInfo: DirInfo = {
            path: firstPath,
            subdirs: [],
            files: []
          }
          // get sub dirs and files, return them all.
          if (needSubItems) {
            await this.getSubdirectoriesAndFiles(firstPath, dirInfo)
          }
          console.log('openDirectory dirInfo', dirInfo)
          return dirInfo
        } else {
          return null
        }
      }
    )
  }

  getSubdirectoriesAndFiles(dirPath: string, dirInfo: DirInfo): Promise<DirInfo> {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, { withFileTypes: true }, (err, dirents) => {
        if (err) {
          return reject(err)
        }

        const result = dirents.reduce(
          (acc, dirent) => {
            if (dirent.isDirectory()) {
              acc.directories.push(dirent.name)
            } else {
              acc.files.push(dirent.name)
            }
            return acc
          },
          { directories: [] as string[], files: [] as string[] }
        )

        dirInfo.subdirs = result.directories
        dirInfo.files = result.files
        resolve(dirInfo)
      })
    })
  }
}
