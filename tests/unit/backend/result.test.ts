import * as Result from 'backend/result';

describe('the Result type', () => {

  describe('when an Error', () => {
    const error = Error();

    describe('isError', () => {
      it('should be true', () => {
        expect(Result.isError(error)).toBeTruthy();
      });
    });

    describe('isSuccess', () => {
      it('should be false', () => {
        expect(Result.isSuccess(error)).toBeFalsy();
      });
    });
  });

  describe('when an Error pretending not to be', () => {
    const error = Error() as unknown as string;

    describe('isError', () => {
      it('should be true', () => {
        expect(Result.isError(error)).toBeTruthy();
      });
    });

    describe('isSuccess', () => {
      it('should be false', () => {
        expect(Result.isSuccess(error)).toBeFalsy();
      });
    });
  });

  describe('when anything else', () => {
    const success = undefined;

    describe('isError', () => {
      it('should be false', () => {
        expect(Result.isError(success)).toBeFalsy();
      });
    });

    describe('isSuccess', () => {
      it('should be true', () => {
        expect(Result.isSuccess(success)).toBeTruthy();
      });
    });
  });
});
