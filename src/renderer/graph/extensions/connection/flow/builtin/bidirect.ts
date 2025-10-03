/* eslint-disable @typescript-eslint/require-await */
import {
  type ClassicScheme,
  type Position,
  type SocketData,
} from "../../types";
import { type Context, Flow, type PickParams } from "../base";
import {
  makeConnection as defaultMakeConnection,
  State,
  type StateContext,
} from "../utils";

/**
 * Bidirect flow params
 */
export type BidirectParams<Schemes extends ClassicScheme> = {
  /** If true, user can pick a pseudo-connection by clicking on socket, not only by pointerdown */
  pickByClick: boolean;
  /** Custom function to make connection */
  makeConnection: <K extends any[]>(
    from: SocketData,
    to: SocketData,
    context: Context<Schemes, K>
  ) => boolean | undefined;
};

class Picked<Schemes extends ClassicScheme, K extends any[]> extends State<
  Schemes,
  K
> {
  public initial: SocketData;
  private params: BidirectParams<Schemes>;

  constructor(initial: SocketData, params: BidirectParams<Schemes>) {
    super();
    this.initial = initial;
    this.params = params;
  }

  async pick(
    { socket }: PickParams,
    context: Context<Schemes, K>
  ): Promise<void> {
    if (this.params.makeConnection(this.initial, socket, context)) {
      this.drop(context, undefined, socket, true);
    } else if (!this.params.pickByClick) {
      this.drop(context, undefined, socket);
    }
  }

  async drop(
    context: Context<ClassicScheme, K>,
    position?: Position,
    socket: SocketData | null = null,
    created = false
  ): Promise<void> {
    if (this.initial) {
      await context.scope.emit({
        type: "connectiondrop",
        data: { initial: this.initial, socket, created, position },
      });
    }
    this.context.switchTo(new Idle<Schemes, K>(this.params));
  }
}

class Idle<Schemes extends ClassicScheme, K extends any[]> extends State<
  Schemes,
  K
> {
  private params: BidirectParams<Schemes>;
  constructor(params: BidirectParams<Schemes>) {
    super();
    this.params = params;
  }

  async pick(
    { socket, event }: PickParams,
    context: Context<Schemes, K>
  ): Promise<void> {
    if (event === "down") {
      if (
        await context.scope.emit({ type: "connectionpick", data: { socket } })
      ) {
        this.context.switchTo(new Picked(socket, this.params));
      } else {
        this.drop(context);
      }
    }
  }

  async drop(
    context: Context<Schemes, K>,
    position?: Position,
    socket: SocketData | null = null,
    created = false
  ): Promise<void> {
    if (this.initial) {
      await context.scope.emit({
        type: "connectiondrop",
        data: { initial: this.initial, socket, created, position },
      });
    }
    delete this.initial;
  }
}

/**
 * Bidirect flow. User can pick a socket and connect it by releasing mouse button.
 * More simple than classic flow, but less functional (can't remove connection by clicking on input socket).
 */
export class BidirectFlow<Schemes extends ClassicScheme, K extends any[]>
  implements StateContext<Schemes, K>, Flow<Schemes, K>
{
  currentState!: State<Schemes, K>;

  constructor(params?: Partial<BidirectParams<Schemes>>) {
    const pickByClick = Boolean(params?.pickByClick);
    const makeConnection = params?.makeConnection || defaultMakeConnection;

    this.switchTo(new Idle({ pickByClick, makeConnection }));
  }

  public async pick(params: PickParams, context: Context<Schemes, K>) {
    await this.currentState.pick(params, context);
  }

  public getPickedSocket() {
    return this.currentState.initial;
  }

  public drop(context: Context<Schemes, K>, position?: Position) {
    return this.currentState.drop(context, position);
  }

  public switchTo(state: State<Schemes, K>): void {
    state.setContext(this);
    this.currentState = state;
  }
}
