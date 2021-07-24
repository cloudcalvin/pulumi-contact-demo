import AbstractLambda from 'backend/abstractLambda';

class ALambda extends AbstractLambda {
  public static endpointLocalStackOrDefault = AbstractLambda.endpointLocalStackOrDefault;
  public static isLocal = AbstractLambda.isLocal;
  public static parseHeaderValue= AbstractLambda.parseHeaderValue;
  public static parseJson = AbstractLambda.parseJson;
}

const ORIGINAL_ENV = process.env;
afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('AbstractLambda', () => {
  describe('when running in a LocalStack lambda invocation', () => {
    const hostname = 'example';
    beforeEach(() => process.env.LOCALSTACK_HOSTNAME = hostname);

    it('endpointLocalStackOrDefault should use the LocalStack endpoint', () => {
      // noinspection HttpUrlsUsage
      expect(ALambda.endpointLocalStackOrDefault()).toEqual(`http://${hostname}:4566`);
    });

    it('isLocal should be true', () => {
      expect(ALambda.isLocal()).toBeTruthy();
    });
  });

  describe('when not running in a LocalStack lambda invocation', () => {
    beforeEach(() => delete process.env.LOCALSTACK_HOSTNAME);

    it('endpointLocalStackOrDefault should use the default endpoint', () => {
      expect(ALambda.endpointLocalStackOrDefault()).toBeUndefined();
    });

    it('isLocal should be false', () => {
      expect(ALambda.isLocal()).toBeFalsy();
    });
  });

  describe('parseHeaderValue', () => {
    it('single item string should be single element array', () => {
      expect(ALambda.parseHeaderValue('a')).toEqual(['a']);
    });

    it('two item string with default delimiter should be two element array', () => {
      expect(ALambda.parseHeaderValue('a, b')).toEqual(['a', 'b']);
    });

    it('two item string with different delimiter should be two element array', () => {
      expect(ALambda.parseHeaderValue('a|b', '|')).toEqual(['a', 'b']);
    });

    it('single element should be single element array', () => {
      expect(ALambda.parseHeaderValue(['a'])).toEqual(['a']);
    });

    it('two elements with default delimiter should be two element array', () => {
      expect(ALambda.parseHeaderValue(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('delimiter should be ignored for array input', () => {
      expect(ALambda.parseHeaderValue(['a|b', 'c'], '|')).toEqual(['a|b', 'c']);
    });
  })

  describe('parseJson', () => {
    it('should result in error when given a null', () => {
      expect(ALambda.parseJson(null as unknown as string)).toBeInstanceOf(Error);
    });

    it('should result in error when JSON cannot be parsed', () => {
      expect(ALambda.parseJson('\0')).toBeInstanceOf(Error);
    });

    it('should result in error when Buffer cannot be decoded', () => {
      /**
       * For my dear friends from Liverpool @thattommyhall and @davecoombes
       */
      function bufferTooLongForStringDecoder() {
        const scouser = Buffer.alloc(0x1fffffe8 + 1).fill('a');
        scouser.fill(' calm down!', scouser.length - 11);
        return scouser;
      }

      const actual = ALambda.parseJson(bufferTooLongForStringDecoder());
      expect(actual).toBeInstanceOf(Error);
    });
  })
});
