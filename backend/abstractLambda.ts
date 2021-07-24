import {DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import {StringDecoder} from 'string_decoder';
import ResultType, * as Result from './result';

/**
 * Provides a number of utility functions a running Lambda might want,
 * including determining if it is running inside a LocalStack executor or not,
 * and various Request parsing utilities.
 */
export default class AbstractLambda {
  /**
   * For establishing access to a DynamoDB.
   */
  protected static dbConfiguration(): DynamoDBClientConfig {
    return {
      endpoint: AbstractLambda.endpointLocalStackOrDefault(),
    };
  }

  /**
   * Supplies the AWS endpoint to use.
   * If running in a local environment, returns the LocalStack endpoint.
   * Otherwise, return `undefined` which means "use the default endpoint" in the the AWS SDK.
   */
  protected static endpointLocalStackOrDefault(): string | undefined {
    // noinspection HttpUrlsUsage
    const url = process.env.LOCALSTACK_HOSTNAME ? `http://${(process.env.LOCALSTACK_HOSTNAME)}:4566` : undefined;
    console.info(`Using endpoint: ${url || '<default>'}`);
    return url;
  }

  /**
   * Determines if the Lambda is running in a local environment or not
   */
  protected static isLocal(): boolean {
    return !!process.env.LOCALSTACK_HOSTNAME;
  }

  /**
   * Useful for parsing a header containing multiple values with a delimiter into an array of values.
   * If the argument is _already_ an array, it is simply returned (the caller will have to decide whether to process each element of the array or not).
   * This reduces repeated conditionals in the request processing code.
   *
   * For example, given the Request header:
   * <pre>
   *   x-forwarded-for: 127.0.0.1, 10.0.0.1
   * </pre>
   * then `parseHeaderValueArray(req.header['x-forwarded-for'])` would return an array of:
   * <pre>
   *   [127.0.0.1, 10.0.0.1]
   * </pre>
   *
   * @param value
   * @param delimiter defaults to splitting comma-delimited (ignoring whitespace) strings
   */
  protected static parseHeaderValue(value: string | string[], delimiter: RegExp | string = /\s?,\s?/): string[] {
    if (typeof value === 'string') {
      return value?.split(delimiter) || [];
    } else {
      return value || [];
    }
  }

  /**
   * Useful for parsing a JSON request entity.
   */
  protected static parseJson(json: string | Buffer): ResultType {
    if (!json) return Error('no body in request');

    const decode = (buffer: Buffer): string => {
      const stringDecoder = new StringDecoder('utf8');
      return stringDecoder.end(buffer);
    };

    try {
      return JSON.parse(json instanceof Buffer ? decode(json) : json);
    } catch (error) {
      return Result.isError(error) ? error : Error(error);
    }
  }
}
