import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function checkIfGitIsInstalled(): string | null {
    try {
        // 获取git的安装路径
        const gitPathStr = execSync('where.exe git', { encoding: 'utf8' })
        const gitPathArr = gitPathStr.split('\r\n')
        if (gitPathArr[0]) {
            const gitDir = path.dirname(gitPathArr[0].trim());
            return path.join(gitDir, '..');
        }
    } catch (error) {
        console.error('Git is not installed or cannot be found.');
    }
    return null;
}

function checkForBashExe(gitInstallDir: string): string | null {
    const possiblePaths = [
        path.join(gitInstallDir, 'bin'),
        path.join(gitInstallDir, 'usr', 'bin')
    ];

    for (const p of possiblePaths) {
        const bashPath = path.join(p, 'bash.exe');
        if (fs.existsSync(bashPath)) {
            return bashPath;
        }
    }
    return null;
}

export function getGitInstallDir(): string {
    const gitInstallDir = checkIfGitIsInstalled();
    if (gitInstallDir) {
        console.log(`Git installation directory: ${gitInstallDir}`);
        const bashExePath = checkForBashExe(gitInstallDir);
        if (bashExePath) {
            console.log(`Found bash.exe at: ${bashExePath}`);
            return gitInstallDir
        } else {
            console.log('Could not find bash.exe in the expected locations.');
        }
    } else {
        console.log('Git is not installed on this system.');
    }
    return ''
}

export function getLMDPortableGit() {

}

export function checkGitFilesExist(gitInstallPath: string): boolean {
  const gitInstallPathExist = fs.existsSync(gitInstallPath)
  if (gitInstallPathExist) {
    const gitExecFileExist = fs.existsSync(path.join(gitInstallPath, 'bin/git.exe'))
    const bashExecFileExist = fs.existsSync(path.join(gitInstallPath, 'bin/bash.exe'))
    if(gitExecFileExist && bashExecFileExist) {
      return true
    }
  }
  return false
}
