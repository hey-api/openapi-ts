type OnCancel = (cancelHandler: () => void) => void;

type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: unknown) => void,
  onCancel: OnCancel,
) => void;

export class CancelablePromise<T> implements Promise<T> {
  private _promise: Promise<T>;
  private _cancelHandlers: (() => void)[] = [];
  private _isCancelled = false;

  readonly [Symbol.toStringTag] = 'CancelablePromise';

  constructor(executor: Executor<T>) {
    this._promise = new Promise<T>((resolve, reject) => {
      const onCancel: OnCancel = (handler) => {
        this._cancelHandlers.push(handler);
      };
      executor(
        (value) => {
          if (!this._isCancelled) resolve(value);
        },
        (reason) => {
          if (!this._isCancelled) reject(reason);
        },
        onCancel,
      );
    });
  }

  cancel(): void {
    this._isCancelled = true;
    for (const handler of this._cancelHandlers) {
      handler();
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<T | TResult> {
    return this._promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this._promise.finally(onfinally);
  }
}
