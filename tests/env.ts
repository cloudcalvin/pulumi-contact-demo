process.env.LOCALSTACK_HOSTNAME = 'localhost';
process.env.LOCALSTACK_ENDPOINT ||= 'http://localhost:4566';

process.env.PULUMI_TEST_MODE = 'true';
process.env.AWS_REGION = 'local-test-1';
