import {Table} from '@pulumi/aws/dynamodb';
import * as cloud from '@pulumi/cloud';
import * as pulumi from '@pulumi/pulumi';
import {Lambda} from 'backend/contact/lambda';

class Inputs {
  static db: pulumi.Output<Table>;

  static tableName() {
    return this.db.get().name.get().toString();
  }
}

export class ContactApi {
  private readonly restResource: string;
  public readonly api: cloud.API;

  constructor(restResource: string, db: pulumi.Input<Table>) {
    Inputs.db = pulumi.output(db);
    this.restResource = restResource.trim();
    this.api = new cloud.API(this.restResource);
  }

  public makeRoutes() {
    this.api.post(`/${this.restResource}`, ContactApi.createContact);
    return this;
  }

  public publish() {
    return this.api.publish();
  }

  static async createContact(req: cloud.Request, res: cloud.Response) {
    await new Lambda(Inputs.tableName()).createContact(req, res);
  }
}
