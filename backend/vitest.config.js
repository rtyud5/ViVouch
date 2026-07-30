import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', 'tests-node/**'],
    fileParallelism: false,
    env: {
      EMAIL_DELIVERY_MODE: 'TEST',
      PAYOS_CLIENT_ID: 'test_client_id',
      PAYOS_API_KEY: 'test_api_key',
      PAYOS_CHECKSUM_KEY: 'TEST_CHECKSUM_KEY'
    }
  },
});
