# Canceling requests

The generated clients support canceling of requests, this works by canceling the promise that
is returned from the request. Each method inside a service (operation) returns a `CancelablePromise`
object. This promise can be canceled by calling the `cancel()` method.

Below is an example of canceling the request after a certain timeout:

```typescript
import { UserService } from './myClient';

const getAllUsers = async () => {

    const request = UserService.getAllUsers();

    setTimeout(() => {
        if (!request.isResolved() && !request.isRejected()) {
            console.warn('Canceling request due to timeout');
            request.cancel();
        }
    }, 1000);

    await request;
};
```

The API of the `CancelablePromise` is similar to a regular `Promise`, but it adds the
`cancel()` method and some additional properties:

```typescript
interface CancelablePromise<TResult> extends Promise<TResult> {
    readonly isResolved: boolean;
    readonly isRejected: boolean;
    readonly isCancelled: boolean;
    cancel: () => void;
}
```

- `isResolved`: Indicates if the promise was resolved.
- `isRejected`: Indicates if the promise was rejected.
- `isCancelled`: Indicates if the promise was canceled.
- `cancel()`: Cancels the promise (and request) and throws a rejection error: `Request aborted`.
