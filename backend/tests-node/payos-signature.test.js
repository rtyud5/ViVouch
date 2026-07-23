import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPayOsSignatureData,
  createPayOsSignature,
  isValidPayOsSignature,
} from '../src/modules/payments/payos.signature.js';

const checksumKey = '1a54716c8f0efb2744fb28b6e38b25da7f67a925d98bc1c18bd8faaecadd7675';
const officialSample = {
  orderCode: 123,
  amount: 3000,
  description: 'VQRIO123',
  accountNumber: '12345678',
  reference: 'TF230204212323',
  transactionDateTime: '2023-02-04 18:25:00',
  currency: 'VND',
  paymentLinkId: '124c33293c43417ab7879e14c8d9eb18',
  code: '00',
  desc: 'Thành công',
  counterAccountBankId: '',
  counterAccountBankName: '',
  counterAccountName: '',
  counterAccountNumber: '',
  virtualAccountName: '',
  virtualAccountNumber: '',
};
const officialSignature = '412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03';

test('buildPayOsSignatureData sorts keys and normalizes null values', () => {
  assert.equal(buildPayOsSignatureData({ z: null, a: 1, b: 'x' }), 'a=1&b=x&z=');
});

test('payOS signature matches official payment webhook sample', () => {
  assert.equal(createPayOsSignature(officialSample, checksumKey), officialSignature);
  assert.equal(isValidPayOsSignature(officialSample, officialSignature, checksumKey), true);
});

test('payOS signature rejects modified amount and malformed signatures', () => {
  assert.equal(isValidPayOsSignature({ ...officialSample, amount: 3001 }, officialSignature, checksumKey), false);
  assert.equal(isValidPayOsSignature(officialSample, 'invalid', checksumKey), false);
});
