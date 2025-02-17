class Result<T, E> {
    private constructor(
        private readonly _ok: boolean,
        private readonly _value?: T,
        private readonly _error?: E
    ) {}

    static ok<T>(value: T): Result<T, never> {
        return new Result<T, never>(true, value);
    }

    static err<E>(error: E): Result<never, E> {
        return new Result<never, E>(false, undefined, error);
    }

    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this._ok) {
            return Result.ok(fn(this._value!));
        }
        return Result.err(this._error!);
    }

    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        if (!this._ok) {
            return Result.err(fn(this._error!));
        }
        return Result.ok(this._value!);
    }

    get isOk(): boolean {
        return this._ok;
    }

    get value(): T {
        if (!this._ok) {
            throw new Error("Cannot access value of an error Result");
        }
        return this._value!;
    }

    get error(): E {
        if (this._ok) {
            throw new Error("Cannot access error of a success Result");
        }
        return this._error!;
    }
}

function isOk<T, E>(result: Result<T, E>): result is Result<T, never> {
    return result.isOk;
}

function isErr<T, E>(result: Result<T, E>): result is Result<never, E> {
    return !result.isOk;
}

export { Result, isOk, isErr };
