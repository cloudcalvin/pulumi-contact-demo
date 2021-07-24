import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import ResultType, * as Result from 'backend/result';
import {ulid} from 'ulid';

export class Table {
  private readonly dbClient: DynamoDB;
  private readonly tableName: string;

  constructor(dbClient: DynamoDB, tableName: string) {
    this.dbClient = dbClient;
    this.tableName = tableName;
  }

  private getParams(id: string) {
    return {
      TableName: this.tableName,
      Key: marshall({id}),
    };
  }

  private putParams(putItem: any) {
    return {
      TableName: this.tableName,
      Item: marshall(putItem, {removeUndefinedValues: true}),
    };
  }

  public async findOne(id: string): Promise<ResultType> {
    try {
      return await this.dbClient.getItem(this.getParams(id))
        .then((v) => v?.Item)  // non-existent Items are expected
        .then(i => {
          if (i) return unmarshall(i);
          throw Error(JSON.stringify({notFound: id}));
        })
        .catch(reason => {
          return Result.fromRejected(reason);
        });
    } catch (error) {
      return Result.fromRejected(error);
    }
  }

  public async insert(data: { emailAddress: string, sourceIp?: string }): Promise<ResultType> {
    const {emailAddress, sourceIp} = data;
    const id = ulid();
    const now = new Date().getTime();

    const putItem = {
      id,
      createdAt: now,
      updatedAt: now,
      emailAddress,
      sourceIp,
    };

    try {
      return this.dbClient.putItem(this.putParams(putItem))
        .then(output => {
          if (output?.$metadata?.httpStatusCode != 200) {
            throw Error(JSON.stringify({data: {...putItem}, ...output}));
          }
          return {...putItem};
        })
        .catch(reason => {
          return Result.fromRejected(reason);
        });
    } catch (error) {
      return Result.fromRejected(error);
    }
  }
}
