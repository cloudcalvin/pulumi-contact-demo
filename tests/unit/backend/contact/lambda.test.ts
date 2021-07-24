import {Request, Response} from '@pulumi/cloud';
import {Lambda} from 'backend/contact/lambda';
import {Table} from 'backend/contact/table';
import {mocked} from 'ts-jest/utils';

jest.mock('@pulumi/cloud');
jest.createMockFromModule('backend/contact/table');

const idCookieName: string = '_id';
const id = 1;
const emailAddress = 'user@example.com';

const findOneDifferentEmail = jest.fn().mockResolvedValue({emailAddress: 'mismatched@example.com'});
const findOneNotFound = jest.fn().mockResolvedValue(Error());
const findId1 = jest.fn().mockResolvedValue({id, emailAddress});
const insertError = jest.fn().mockResolvedValue(Error('PutItem failed'));
const insertId1 = jest.fn().mockResolvedValue({id});

const mockRequest = mocked({} as unknown as Request);
const mockResponse = mocked({} as unknown as Response);

describe('contact lambda', () => {
  const lambda = new Lambda('test');

  beforeEach(() => {
    mockRequest.headers = {cookie: ''};
    mockResponse.end = mockResponse.json = jest.fn();
    mockResponse.setHeader = mockResponse.status = mockResponse.write = jest.fn().mockReturnThis();
  });

  it('no body should be bad request', async () => {
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('body not parseable as JSON should be bad request', async () => {
    mockRequest.body = Buffer.from('{');
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('no emailAddress should be unprocessable entity', async () => {
    mockRequest.body = Buffer.from('{}');
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(422);
  });

  it('with emailAddress and no cookie should set cookie', async () => {
    Table.prototype.insert = insertId1;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('set-cookie', `${idCookieName}=${id}; Max-Age=7776000; Secure; SameSite=Strict`);
  });

  it('with emailAddress and no cookie should be created', async () => {
    Table.prototype.insert = insertId1;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  it('with emailAddress and bad cookie should be created', async () => {
    Table.prototype.insert = insertId1;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    mockRequest.headers.cookie = `${idCookieName}=`;
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  it('with emailAddress and cookie and existing item should be ok', async () => {
    Table.prototype.findOne = findId1;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    mockRequest.headers.cookie = `${idCookieName}=1`;
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('with emailAddress and cookie but with item not found should be conflict', async () => {
    Table.prototype.findOne = findOneNotFound;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    mockRequest.headers.cookie = `${idCookieName}=1`;
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
  });

  it('with emailAddress and cookie but with mismatched emailAddress value should be conflict', async () => {
    Table.prototype.insert = insertId1;
    Table.prototype.findOne = findOneDifferentEmail;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    mockRequest.headers.cookie = `${idCookieName}=${id}`;
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
  });

  it('with emailAddress but insert error should be bad gateway', async () => {
    Table.prototype.insert = insertError;
    mockRequest.body = Buffer.from(JSON.stringify({emailAddress}));
    await lambda.createContact(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(502);
  });
});
