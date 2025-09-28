/**
 * A helper class that allows registering a function with a frame delay.
 * When emit() is called, the function will be executed after the specified number of frames.
 * Additional emit() calls during the delay period won't cause additional executions.
 */
export class FrameEmitter {
  private callback: () => void;
  private frameDelay: number;
  private pendingFrames: number = 0;
  private isScheduled: boolean = false;

  /**
   * Creates a new FrameEmitter instance.
   * @param callback The function to call after the frame delay
   * @param frameDelay Number of frames to wait before calling the function
   */
  constructor(callback: () => void, frameDelay: number) {
    this.callback = callback;
    this.frameDelay = Math.max(0, Math.floor(frameDelay));
  }

  /**
   * Emits a call to the registered function after the specified frame delay.
   * If called multiple times during the delay period, only one execution will occur.
   */
  emit(): void {
    if (this.isScheduled) {
      // Already scheduled, ignore additional calls
      return;
    }

    this.isScheduled = true;
    this.pendingFrames = this.frameDelay;

    if (this.frameDelay === 0) {
      // Execute immediately if no delay
      this.executeCallback();
    } else {
      // Schedule execution after frame delay
      this.scheduleNextFrame();
    }
  }

  flush(): void {
    if (this.isScheduled) {
      this.cancel();
      this.executeCallback();
    }
  }

  /**
   * Cancels any pending execution.
   */
  cancel(): void {
    this.isScheduled = false;
    this.pendingFrames = 0;
  }

  /**
   * Returns true if there's a pending execution scheduled.
   */
  isPending(): boolean {
    return this.isScheduled;
  }

  /**
   * Returns the number of frames remaining before execution.
   */
  getRemainingFrames(): number {
    return this.pendingFrames;
  }

  private scheduleNextFrame(): void {
    requestAnimationFrame(() => {
      if (!this.isScheduled) {
        // Execution was cancelled
        return;
      }

      this.pendingFrames--;

      if (this.pendingFrames <= 0) {
        this.executeCallback();
      } else {
        this.scheduleNextFrame();
      }
    });
  }

  private executeCallback(): void {
    this.isScheduled = false;
    this.pendingFrames = 0;
    this.callback();
  }
}

/**
 * Creates a new FrameEmitter instance.
 * @param callback The function to call after the frame delay
 * @param frameDelay Number of frames to wait before calling the function
 * @returns A new FrameEmitter instance
 */
export function createFrameEmitter(
  callback: () => void,
  frameDelay: number
): FrameEmitter {
  return new FrameEmitter(callback, frameDelay);
}
