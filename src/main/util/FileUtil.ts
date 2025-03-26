import fs from 'fs'
import { rimrafSync } from 'rimraf'

export default class FileUtil {
  static removeFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        rimrafSync(filePath)
        // fs.unlinkSync(filePath)
        console.log('file removed:', filePath)
      } else {
        console.log('file dose not exist:', filePath)
      }
    } catch (err) {
      console.error('remove file error:', err)
    }
  }
}
