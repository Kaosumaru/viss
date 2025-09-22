export type Disposable = () => () => void;

export class DisposeHelper {
  private disposables: (() => void)[] = [];

  add(disposable: Disposable) {
    this.disposables.push(disposable());
  }

  addDispose(dispose: () => void) {
    this.disposables.push(dispose);
  }

  dispose() {
    this.disposables.forEach((dispose) => {
      dispose();
    });
    this.disposables = [];
  }
}
