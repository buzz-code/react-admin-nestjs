import { validateSync } from 'class-validator';
import { IsDigitsOnly } from '../numeric-string.util';

class Sample {
  @IsDigitsOnly()
  value: string;
}

class SampleWithMaxLength {
  @IsDigitsOnly(5)
  value: string;
}

const errorsFor = (value: any, target = Sample) => {
  const instance = new (target as any)();
  instance.value = value;
  return validateSync(instance);
};

describe('IsDigitsOnly', () => {
  it('passes for undefined, null and empty string (blank is not this validator\'s job)', () => {
    expect(errorsFor(undefined)).toHaveLength(0);
    expect(errorsFor(null)).toHaveLength(0);
    expect(errorsFor('')).toHaveLength(0);
  });

  it('passes for a digits-only string, leading zeros included', () => {
    expect(errorsFor('0123456789')).toHaveLength(0);
  });

  it('fails for letters or symbols', () => {
    expect(errorsFor('12a34')).toHaveLength(1);
    expect(errorsFor('123-456')).toHaveLength(1);
    expect(errorsFor('abc')).toHaveLength(1);
  });

  it('fails for a non-string value', () => {
    expect(errorsFor(12345)).toHaveLength(1);
  });

  it('enforces an optional max length', () => {
    expect(errorsFor('12345', SampleWithMaxLength)).toHaveLength(0);
    expect(errorsFor('123456', SampleWithMaxLength)).toHaveLength(1);
  });
});
