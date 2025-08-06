export type Disposable = () => () => void;

export class DisposeHelper {
  private disposables: (() => void)[] = [];

  add(disposable: Disposable) {
    this.disposables.push(disposable());
  }

  dispose() {
    this.disposables.forEach((dispose) => dispose());
    this.disposables = [];
  }
}
