import {DynamoDB} from '@aws-sdk/client-dynamodb';

import * as cloud from '@pulumi/cloud';
import AbstractLambda from 'backend/abstractLambda';
import ResultType, * as Result from 'backend/result';
import * as cookie from 'cookie';
import {Table} from './table';

const idCookieName: string = '_id';

const idCookie = (req: cloud.Request) =>
  (req.headers.cookie) ? cookie.parse(req.headers.cookie.toString())[idCookieName] : undefined;

function makeIdCookie(id: string) {
  const maxAge = 60 * 60 * 24 * 90; // 90 days
  return cookie.serialize(idCookieName, id, {secure: true, sameSite: true, maxAge});
}

export class Lambda extends AbstractLambda {
  private readonly table: Table;

  constructor(tableName: string) {
    super();
    const dbClient = new DynamoDB(Lambda.dbConfiguration());
    this.table = new Table(dbClient, tableName);
  }

  async createContact(req: cloud.Request, res: cloud.Response) {
    const body = Lambda.parseJson(req.body);
    if (Result.isError(body)) {
      res.status(400).end(body.toString());
      return;
    }

    const {emailAddress} = body;
    if (!emailAddress) {
      res.status(422).end('emailAddress must be specified');
      return;
    }

    const existingId = await this.findExistingContact(idCookie(req), emailAddress);
    if (Result.isError(existingId)) {
      const message = JSON.stringify({error: existingId.name, message: existingId.message});
      console.error(message);
      res.status(409);
      Lambda.isLocal() ? res.end(message) : res.end();
      return;
    }

    if (existingId) {
      res.status(200)
        .setHeader('set-cookie', makeIdCookie(existingId))
        .end();
      return;
    }

    const sourceIp = Lambda.parseHeaderValue(req.headers['x-forwarded-for'])[0];

    const result = await this.table.insert({emailAddress, sourceIp});
    if (Result.isError(result)) {
      const message = JSON.stringify({error: result.name, message: result.message});
      console.error(message);
      res.status(502);
      return Lambda.isLocal() ? res.end(message) : res.end();
    }

    return res.status(201)
      .setHeader('set-cookie', makeIdCookie(result.id))
      .end();
  }

  private async findExistingContact(idFromCookie: string | undefined, emailAddress: string): Promise<ResultType> {
    if (!idFromCookie) return undefined;

    return this.table.findOne(idFromCookie)
      .then(item => {
        if (Result.isError(item)) return item;
        if (item.emailAddress != emailAddress) return Error(`mismatched id ${item.id} is not email ${emailAddress}`);
        return item.id;
      });
  }
}
