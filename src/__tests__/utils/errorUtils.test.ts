import { describe, it, expect, vi } from 'vitest';
import { handleError, showUserFriendlyError, AppError } from '@/utils/errorUtils';

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('errorUtils', () => {
  describe('handleError', () => {
    it('should handle string errors', () => {
      const result = handleError('Test error message');
      
      expect(result.message).toBe('Test error message');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = handleError(error);
      
      expect(result.message).toBe('Test error');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle AppError with context', () => {
      const error = new AppError('Test app error', 'TEST_CODE', 'test context');
      const result = handleError(error);
      
      expect(result.message).toBe('Test app error');
      expect(result.code).toBe('TEST_CODE');
      expect(result.context).toBe('test context');
    });
  });

  describe('showUserFriendlyError', () => {
    it('should show friendly message for network errors', () => {
      const { toast } = require('sonner');
      
      showUserFriendlyError('Network Error: fetch failed');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Problema de conexão. Verifique sua internet e tente novamente.'
      );
    });

    it('should show friendly message for 401 errors', () => {
      const { toast } = require('sonner');
      
      showUserFriendlyError('401 Unauthorized');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Sessão expirada. Faça login novamente.'
      );
    });

    it('should show original message for unknown errors', () => {
      const { toast } = require('sonner');
      
      showUserFriendlyError('Unknown error');
      
      expect(toast.error).toHaveBeenCalledWith('Unknown error');
    });
  });
});