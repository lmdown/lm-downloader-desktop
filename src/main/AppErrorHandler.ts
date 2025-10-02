import { app, dialog, BrowserWindow } from 'electron';

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
}

export default class AppErrorHandler {
  isMainWindowCreated = false;

  constructor() {
    this.setupErrorHandlers();
  }

  setupErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.handleError('Error 出错 [ue]', error);
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      console.error('unhandled Promise rejection:', error);
      this.handleError('Error 失败 [ur]', error);
    });
  }

  /**
   * show error dialog
   */
  handleError(title: string, error: Error): void {
    console.error(`${title}:`, error);

    if(!this.isMainWindowCreated) {
      dialog.showErrorBox(
        title,
        `${error.message}\n\n` +
        `${error.stack}\n\n` +
        `Please restart this app or contact our technical support team. 请重启程序或联系技术支持。https://seemts.com/`
      );
    } else {
      console.log('isMainWindowCreated true. only log')
    }

    this.logError(error);

    // exit app
    // setTimeout(() => {
    //   process.exit(1);
    // }, 1000);
  }

  /**
   * save log erro
   */
  private logError(error: Error): void {
    const errorInfo: ErrorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };

    console.error('error detail:', JSON.stringify(errorInfo, null, 2));
  }

}
