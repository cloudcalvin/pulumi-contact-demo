import {Table} from '@pulumi/aws/dynamodb';
import {HttpDeployment} from '@pulumi/cloud';
import * as pulumi from '@pulumi/pulumi';
import {Stack} from 'infra/stack';
import {ContactApi} from './api';
import {contactTable} from './database';

export class Contact {
  private readonly web: HttpDeployment;
  private readonly table: Table;

  constructor(_config: pulumi.Config, stack: Stack) {
    const resourceName: string = this.resourceName();

    this.table = contactTable(resourceName, stack);  // convention: use name of resource and stack in logical name of table for CRUD
    this.web = new ContactApi(resourceName, this.table).makeRoutes().publish();
  }

  private resourceName() {
    return this.constructor.name.toLowerCase();
  }
}
