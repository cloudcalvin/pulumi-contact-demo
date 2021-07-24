import {LocalProgramArgs, LocalWorkspace} from '@pulumi/pulumi/automation';
import got from 'got';
import {getCurrentStackName} from 'tests/pulumiHelper';

const name = 'contact';

let url: string;

beforeAll(async () => {
  const stackName = await getCurrentStackName();
  if (!stackName.startsWith('local')) fail(`Only running tests on LocalStack stacks named "local*"`);

  const localProgArgs: LocalProgramArgs = {
    stackName,
    workDir: '.',
  };
  const stack = await LocalWorkspace.selectStack(localProgArgs);
  const outputs = await stack.outputs();
  const restApiId = outputs.contact.value.web.api.restAPI.id;

  // noinspection HttpUrlsUsage
  url = `${process.env.LOCALSTACK_ENDPOINT}/restapis/${restApiId}/stage/_user_request_/${name}`;
});

describe('Contact API', async () => {
  it('should include an id in a set-cookie response header', async () => {
    const {headers} = await got.post(url, {json: {emailAddress: 'user@example.com'}});
    expect(headers['set-cookie']?.join('')).toMatch(/_id=/);
  });
});
