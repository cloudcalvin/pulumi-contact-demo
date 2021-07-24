import * as pulumi from '@pulumi/pulumi';
import {Contact} from './contact';
import registerAutoTags from './registerAutoTags';
import {Stack} from './stack';

const stack = Stack.getCurrent();
const config = new pulumi.Config('app');

registerAutoTags({
  'iac:ManagedBy': 'pulumi',
  'iac:Project': stack.project,
  'iac:Stack': stack.name,
});

export const contact = new Contact(config, stack);
