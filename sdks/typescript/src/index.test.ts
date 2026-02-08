import { describe, expect, it } from 'vitest';
import { HydricGateway, HydricInvalidParamsError } from './index.js';

// Helper class to test protected methods
class TestHydricGateway extends HydricGateway {
  public testGetHeaders() {
    return this.getHeaders();
  }
  public testGetBaseUrl() {
    return this.getBaseUrl();
  }
}

describe('HydricGateway', () => {
  const apiKey = 'sk_test_123';

  describe('constructor', () => {
    it('should initialize correctly with a valid API key', () => {
      const hydric = new HydricGateway({ apiKey });
      expect(hydric).toBeInstanceOf(HydricGateway);
    });

    it('should initialize with a custom baseUrl', () => {
      const customUrl = 'https://custom.api.com';
      const hydric = new HydricGateway({ apiKey, baseUrl: customUrl });
      expect(hydric.multichainTokens).toBeDefined();
    });

    it('should throw HydricValidationError if API key is missing', () => {
      try {
        new HydricGateway({ apiKey: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        expect((error as HydricInvalidParamsError).name).toBe('HydricInvalidParamsError');
      }
    });

    it('should initialize the tokens resource', () => {
      const hydric = new HydricGateway({ apiKey });
      expect(hydric.multichainTokens).toBeDefined();
      expect(typeof hydric.multichainTokens.list).toBe('function');
      expect(hydric.tokenBaskets).toBeDefined();
      expect(typeof hydric.tokenBaskets.list).toBe('function');
    });

    it('should include the dashboard URL in the validation error message', () => {
      try {
        new HydricGateway({ apiKey: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        const err = error as HydricInvalidParamsError;
        expect(err.message).toContain('https://dashboard.hydric.org');
      }
    });
  });

  describe('getHeaders', () => {
    it('should return correct authentication and content-type headers', () => {
      const hydric = new TestHydricGateway({ apiKey });
      const headers = hydric.testGetHeaders() as Record<string, string>;

      expect(headers.Authorization).toBe(`Bearer ${apiKey}`);
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('getBaseUrl', () => {
    it('should return the correct base API URL from environment or default', () => {
      const hydric = new TestHydricGateway({ apiKey });
      expect(hydric.testGetBaseUrl()).toBe('https://api.hydric.org');
    });
  });
});
