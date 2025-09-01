type RequestHandler<Request> = (req: Request) => void;

interface PendingRequest<Response> {
  resolve: (res: Response) => void;
  reject: (err: unknown) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export interface IMessage {
  requestId: string | number;
}

export class AsyncRequestManager<
  Request extends IMessage,
  Response extends IMessage
> {
  private pending = new Map<string | number, PendingRequest<Response>>();

  constructor(
    sendFn: RequestHandler<Request>,
    timeoutMs: number = 10000 // optional timeout for requests
  ) {
    this.sendFn = sendFn;
    this.timeoutMs = timeoutMs;
  }

  private sendFn: RequestHandler<Request>;
  private timeoutMs: number = 10000;

  /**
   * Call this when a new response arrives from worker/API.
   */
  handleResponse(res: Response) {
    const id = res.requestId;
    const pending = this.pending.get(id);
    if (!pending) return;

    pending.resolve(res);
    if (pending.timeoutId) clearTimeout(pending.timeoutId);
    this.pending.delete(id);
  }

  /**
   * Makes a request and waits for its response.
   */
  async request(req: Request): Promise<Response> {
    const id = req.requestId;

    return new Promise<Response>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request ${id} timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this.pending.set(id, { resolve, reject, timeoutId });

      // Actually send the request
      try {
        this.sendFn(req);
      } catch (err) {
        clearTimeout(timeoutId);
        this.pending.delete(id);
        reject(err);
      }
    });
  }
}
