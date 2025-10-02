import { app, dialog, BrowserWindow } from 'electron';

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
}

export default class AppErrorHandler {
  private isAppReady = false;

  constructor() {
    this.setupErrorHandlers();
  }

  setupErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.handleError('Start Error 启动失败 [ue]', error);
    });

    // 处理未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      console.error('unhandled Promise rejection:', error);

      if (!this.isAppReady) {
        this.handleError('Start Error 启动失败 [ur]', error);
      }
    });
  }

  /**
   * show error dialog
   */
  handleError(title: string, error: Error): void {
    console.error(`${title}:`, error);

    dialog.showErrorBox(
      title,
      `${error.message}\n\n` +
      `Please restart this app or contact our technical support team. 请重启程序或联系技术支持。https://seemts.com/`
    );

    this.logError(error);

    // exit app
    setTimeout(() => {
      process.exit(1);
    }, 1000);
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
