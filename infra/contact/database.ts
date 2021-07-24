import * as aws from '@pulumi/aws';
import {Stack} from 'infra/stack';

export function contactTable(tableName: string, stack: Stack) {
  const table = new aws.dynamodb.Table(stack.logicalName(tableName), {
    attributes: [
      {
        name: 'id',
        type: 'S',
      },
      {
        name: 'createdAt',
        type: 'N',
      },
      {
        name: 'emailAddress',
        type: 'S',
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'id',
    globalSecondaryIndexes: [
      {
        name: 'createdAt-emailAddress-index',
        hashKey: 'createdAt',
        rangeKey: 'emailAddress',
        projectionType: 'KEYS_ONLY',
      },
    ],
  });


  return table;
}
