/**
 * Usage when just returning a Result:
 *
 * ```typescript
 * import Result from 'result';
 *
 * function parseInt(s: string): Result<number> {
 *   try {
 *      return Number.parseInt(s);
 *   } catch (e) {
 *     return e;
 *   }
 * }
 * ```
 *
 */
type NonError = Exclude<any, Error>;
type ResultType = Error | NonError;
export default ResultType;

/**
 * Determines if the parameter is an Error.
 *
 * ```typescript
 * import * as Result from 'result';
 *
 * const i = parseInt("1");
 * if (Result.isError(i)) {
 *   ...
 * }
 * ```
 */
export function isError(it: ResultType): it is Error {
  return it instanceof Error;
}

/**
 * Determines if the parameter is not an Error.
 *
 * ```typescript
 * import * as Result from 'result';
 *
 * const i = parseInt("1");
 * if (Result.isSuccess(i)) {
 *   ...
 * }
 * ```
 */
export function isSuccess(it: ResultType): it is NonError {
  return !isError(it);
}

/**
 * Turns Promise<never> (rejected) into resolved Promise<Error> (resolved),
 * wrapping a non-Error reason into an Error if needed.
 * The caller of the async method should then use the Result type to determine error or success.
 */
export function fromRejected(reason: any): Promise<Error> {
  return isError(reason) ? Promise.resolve(reason) : Promise.resolve(Error(reason));
}
