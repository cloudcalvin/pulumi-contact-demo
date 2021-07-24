import * as pulumi from '@pulumi/pulumi';

export class Stack {
  public readonly name: string;
  public readonly project: string;

  /**
   * @param {string} name trimmed and lower-cased
   */
  constructor(name: string) {
    this.name = name.trim().toLowerCase();
    this.project = pulumi.getProject();
  }

  /**
   * @param {string} resource
   * @returns {string} ${resource} if in a "prod" or "local" stack, ${resource}_${stack} otherwise
   * @see isLocal
   * @see isProd
   */
  public logicalName = (resource: string) => this.isProd() || this.isLocal() ? resource : `${resource}_${this.name}`;

  /**
   * @param {string} fqdn The fully-qualified domain name
   * @param {number} tldSegments Optional number of segments in the top-level domain part of the FQDN (defaults to 2)
   * @returns {string} inserts stack name to `fqdn`, except if in a "prod" stack
   * @example prod
   * dnsPrefixed('priv') => 'priv'
   * @example test
   * dnsPrefixed('priv') => 'test.priv'
   * @example test
   * dnsPrefixed('example.com') => 'test.example.com'
   * @example dev
   * dnsPrefixed('www.example.com') => 'www.dev.example.com'
   * @example staging
   * dnsPrefixed('admin.tenant1.example.com', 3) => 'admin.staging.tenant1.example.com'
   * @see isProd
   */
  public dnsPrefixed = (fqdn: string, tldSegments: number = 2) => {
    if (this.isProd()) return fqdn;

    const suffix = fqdn.split('.').slice(0 - tldSegments).join('.');
    const prefix = fqdn.slice(0, 0 - suffix.length);
    return `${prefix}${this.name}.${suffix}`;
  };

  public isProd = (): boolean => this.name === 'prod';
  public isLocal = (): boolean => this.name.startsWith('local');

  static getCurrent(): Stack {
    return new Stack(pulumi.getStack());
  }
}
