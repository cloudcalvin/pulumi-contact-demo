import {promisify} from 'util';
const exec = promisify(require('child_process').exec);

export async function getCurrentStackName(): Promise<string> {
  const {stdout} = await exec('pulumi stack --show-name');
  return stdout.toString().trim();
}
