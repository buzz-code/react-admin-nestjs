import { ValidateBy, ValidationArguments, ValidationOptions } from 'class-validator';

const DIGITS_ONLY_REGEX = /^\d+$/;

/**
 * Validates that a varchar identifier field (a TZ/ID number or a business
 * "number") contains digits only. Kept as a string column (not a numeric
 * type) so leading zeros aren't lost.
 *
 * Blank (undefined/null/'') always passes here — presence is @IsNotEmpty's
 * job. Optionally also enforces a max length, for fields whose @Column
 * length has no matching @MaxLength validator yet.
 */
export function IsDigitsOnly(maxLength?: number, validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isDigitsOnly',
      constraints: [maxLength],
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          if (value === undefined || value === null || value === '') return true;
          if (typeof value !== 'string' || !DIGITS_ONLY_REGEX.test(value)) return false;
          const max = args.constraints[0];
          return max === undefined || value.length <= max;
        },
        defaultMessage: () => 'יש להזין ספרות בלבד',
      },
    },
    validationOptions,
  );
}
