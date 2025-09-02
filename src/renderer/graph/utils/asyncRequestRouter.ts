import type { IAsyncRequestManager, IMessage } from "./asyncRequestManager";

type RequestHandler<Request> = (req: Request) => void;

export class AsyncRequestRouter<BaseRequest extends IMessage> {
  constructor(sendFn: RequestHandler<BaseRequest>) {
    this.sendFn = sendFn;
  }

  registerManager<Request extends BaseRequest, Response extends IMessage>(
    id: Response["type"],
    constructor: new (sendFn: RequestHandler<Request>) => IAsyncRequestManager<
      Request,
      Response
    >
  ): (req: Request) => Promise<Response> {
    const manager = new constructor(this.sendFn);
    this.managers.set(id, manager);
    return (req: Request) => manager.request(req);
  }

  handleResponse(res: IMessage): boolean {
    const manager = this.managers.get(res.type);
    if (manager) {
      manager.handleResponse(res);
      return true;
    }
    return false;
  }

  private managers = new Map<
    unknown,
    IAsyncRequestManager<IMessage, IMessage>
  >();

  private sendFn: RequestHandler<BaseRequest>;
}
