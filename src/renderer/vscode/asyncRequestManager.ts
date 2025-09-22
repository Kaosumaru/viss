type RequestHandler<Request> = (req: Request) => void;

interface PendingRequest<Response> {
  resolve: (res: Response) => void;
  reject: (err: unknown) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export interface IRequest {
  type: string;
  requestId?: unknown;
  params?: unknown;
}

export interface IAsyncRequestManager<
  Request extends IRequest,
  Response extends IRequest
> {
  request(req: Request["params"]): Promise<Response["params"]>;
  handleResponse(res: Response): void;
}

export class AsyncRequestManager<
  Request extends IRequest,
  Response extends IRequest
> implements IAsyncRequestManager<Request, Response>
{
  private pending = new Map<unknown, PendingRequest<Response["params"]>>();
  private type: string;
  private requestId = 0;

  constructor(
    type: string,
    sendFn: RequestHandler<Request>,
    timeoutMs: number = 10000 // optional timeout for requests
  ) {
    this.type = type;
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

    pending.resolve(res.params);
    if (pending.timeoutId) clearTimeout(pending.timeoutId);
    this.pending.delete(id);
  }

  /**
   * Makes a request and waits for its response.
   */
  async request(params: Request["params"]): Promise<Response["params"]> {
    const req: Request = {
      type: this.type,
      requestId: this.requestId++,
      params,
    } as Request; // TODO this cast isn't ideal, but it will do
    const id = req.requestId;

    return new Promise<Response["params"]>((resolve, reject) => {
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
        if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error("Unknown error during request sending"));
        }
      }
    });
  }
}
