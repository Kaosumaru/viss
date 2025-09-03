import type { IAsyncRequestManager, IRequest } from "./asyncRequestManager";

type RequestHandler<Request> = (req: Request) => void;

export class AsyncRequestRouter<BaseRequest extends IRequest> {
  constructor(sendFn: RequestHandler<BaseRequest>) {
    this.sendFn = sendFn;
  }

  registerManager<Request extends BaseRequest, Response extends IRequest>(
    id: Response["type"],
    constructor: new (
      type: string,
      sendFn: RequestHandler<BaseRequest>
    ) => IAsyncRequestManager<Request, Response>
  ): (req: Request["params"]) => Promise<Response["params"]> {
    const manager = new constructor(id, this.sendFn);
    this.managers.set(id, manager);
    return (params: Request["params"]) => manager.request(params);
  }

  handleResponse(res: IRequest): boolean {
    const manager = this.managers.get(res.type);
    if (manager) {
      manager.handleResponse(res);
      return true;
    }
    return false;
  }

  private managers = new Map<
    unknown,
    IAsyncRequestManager<IRequest, IRequest>
  >();

  private sendFn: RequestHandler<BaseRequest>;
}
