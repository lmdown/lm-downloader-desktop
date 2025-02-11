import { execSync } from 'child_process';

export default class SystemCommandUtil {

  static runCommand(command): string {
    if(command) {
      try {
        const stdout = execSync(command);
        let result = stdout.toString()
        if(result) {
          result = result.trim()
        }
        console.log('runCommand -- cmd:', command)
        console.log('runCommand -- result', result)
        return result
      } catch (error) {
        console.error('runCommand err', error);
      }
    }
    return ''
  }

}
