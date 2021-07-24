import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {Table} from 'backend/contact/table';
import {mocked} from 'ts-jest/utils';

jest.mock('@aws-sdk/client-dynamodb');

const getItemId1 = jest.fn().mockResolvedValue({Item: {id: {S: '1'}}});
const getItemNotFound = jest.fn().mockResolvedValue(undefined);
const getItemError = jest.fn().mockRejectedValue(undefined);
const putItemId1 = jest.fn().mockResolvedValue({$metadata: {httpStatusCode: 200}, Attributes: {id: {S: '1'}}});
const unexpectedError = Error('unexpected');
const expectedError = {$metadata: {httpStatusCode: 500}};
const putItemUnexpectedError = jest.fn().mockRejectedValue(unexpectedError);
const putItemError = jest.fn().mockResolvedValue(expectedError);

describe('contact table', () => {
  const table = new Table(mocked(DynamoDB.prototype), 'test-table');

  describe('findOne', () => {
    const mockedGetItem = mocked(DynamoDB.prototype.getItem);

    it('promises an existing item by id', async () => {
      mockedGetItem.mockImplementation(getItemId1);
      const result = await table.findOne('1');
      expect(result?.id).toBe('1');
    });

    it('promises an Error result when no existing item', async () => {
      mockedGetItem.mockImplementation(getItemNotFound);
      const result = await table.findOne('1');
      expect(result).toBeInstanceOf(Error);
    });

    it('promises an Error result after an error', async () => {
      mockedGetItem.mockImplementation(getItemError);
      const result = await table.findOne('1');
      await expect(result).toBeInstanceOf(Error);
    });
  });

  describe('insert', () => {
    const mockedPutItem = mocked(DynamoDB.prototype.putItem);

    it('promises attributes with a non-blank id', async () => {
      mockedPutItem.mockImplementation(putItemId1);
      const now = Date.now();
      const result = await table.insert({emailAddress: ''});
      expect(result.id.length).not.toBe(0);
    });

    it('promises an Error result after an unexpected error', async () => {
      mockedPutItem.mockImplementation(putItemUnexpectedError);
      const result = await table.insert({emailAddress: ''});
      expect(result).toEqual(unexpectedError);
    });

    it('promises an Error result after an API error', async () => {
      mockedPutItem.mockImplementation(putItemError);
      const result = await table.insert({emailAddress: ''});
      expect(result).toBeInstanceOf(Error);
    });

    it('promises details of Error after an API error', async () => {
      mockedPutItem.mockImplementation(putItemError);
      const result = await table.insert({emailAddress: ''});
      let message = JSON.parse(result.message);
      expect(message).toMatchObject(expectedError);
    });
  });
});
