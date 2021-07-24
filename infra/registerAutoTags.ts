import {runtime} from '@pulumi/pulumi';

/**
 * Automatically prepends the provided tags to any taggable resource.
 * The automatic tags can be explicitly overridden by the tag property on the resource.
 *
 * For tags with static, un-computed values that might only need to exist for certain stacks,
 * use `aws:defaultTags` in the `Pulumi.<stack>.yaml` file:
 * ```
    aws:defaultTags:
      tags:
        someTagName: some tag value
 * ```
 *
 * @see https://www.pulumi.com/blog/automatically-enforcing-aws-resource-tagging-policies/
 */
export default function registerAutoTags(autoTags: Record<string, string>): void {
  runtime.registerStackTransformation((args) => {
    const props = args.props;
    if (props.hasOwnProperty('tags')) {
      props.tags = {...autoTags, ...props.tags};
      return {props: props, opts: args.opts};
    }
    return undefined;
  });
}
