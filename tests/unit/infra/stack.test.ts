import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as runtime from '@pulumi/pulumi/runtime';
import {Stack} from 'infra/stack';
import {mocked} from 'ts-jest/utils';

const pulumiRuntimeMocks: runtime.Mocks = {
  call: jest.fn().mockReturnValue(mocked({})),
  newResource: jest.fn().mockReturnValue({id: undefined, state: mocked({})}),
};

describe('stack', () => {
  describe('aws provider', () => {
    it('gets region from AWS_REGION', () => {
      // see tests/env.ts for setting of environment variable
      expect(aws.config.region).toEqual('local-test-1');
    });
  });

  describe('Stack', () => {
    const projectName = 'unit-infra';
    const resource = 'foo';

    describe('local stack', () => {
      const stackName = 'local-test';
      let stack: Stack;

      beforeEach(() => {
        pulumi.runtime.setMocks(pulumiRuntimeMocks, projectName, stackName, true);
        stack = Stack.getCurrent();
      });

      it('name', () => {
        expect(stack.name).toEqual(stackName);
      });

      it('isLocal should be true', () => {
        expect(stack.isLocal()).toBeTruthy();
      });

      it('isProd should be false', () => {
        expect(stack.isProd()).toBeFalsy();
      });

      it('logical name should be unchanged', () => {
        expect(stack.logicalName(resource)).toEqual(resource);
      });

      it('dns should be stackName.resource', () => {
        expect(stack.dnsPrefixed(resource)).toEqual(`${stackName}.${resource}`);
      });
    });

    describe('prod stack', () => {
      const stackName = 'prod';
      let stack: Stack;

      beforeEach(() => {
        pulumi.runtime.setMocks(pulumiRuntimeMocks, projectName, stackName, true);
        stack = Stack.getCurrent();
      });

      it('isLocal should be false', () => {
        expect(stack.isLocal()).toBeFalsy();
      });

      it('isProd should be true', () => {
        expect(stack.isProd()).toBeTruthy();
      });

      it('logical name should be unchanged', () => {
        expect(stack.logicalName(resource)).toEqual(resource);
      });

      it('dns should be unchanged', () => {
        expect(stack.dnsPrefixed(resource)).toEqual(resource);
      });
    });

    describe('sandbox stack', () => {
      const stackName = 'sandbox';
      let stack: Stack;

      beforeEach(() => {
        pulumi.runtime.setMocks(pulumiRuntimeMocks, projectName, stackName, true);
        stack = Stack.getCurrent();
      });

      it('isLocal should be false', () => {
        expect(stack.isLocal()).toBeFalsy();
      });

      it('isProd should be false', () => {
        expect(stack.isProd()).toBeFalsy();
      });

      it('logical name should be resource_stackName', () => {
        expect(stack.logicalName(resource)).toEqual(`${resource}_${stackName}`);
      });

      it('dns should be stackName.resource', () => {
        expect(stack.dnsPrefixed(resource)).toEqual(`${stackName}.${resource}`);
      });
      it('dns should be stackName.resource with longer TLD', () => {
        const resource = "www.tenant.example.com"
        expect(stack.dnsPrefixed(resource, 3)).toEqual(`www.${stackName}.tenant.example.com`);
      });
    });
  });
});
