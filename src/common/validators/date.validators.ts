import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { isValidDateString } from '../utils/date.util.js';

/** Validates that the property is a real calendar date formatted YYYY-MM-DD. */
export function IsCalendarDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCalendarDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return isValidDateString(value);
        },
        defaultMessage(): string {
          return '$property must be a valid calendar date formatted YYYY-MM-DD';
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'isDateAfterOrEqual', async: false })
class DateAfterOrEqualConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const related = (args.object as Record<string, unknown>)[args.constraints[0] as string];
    return isValidDateString(value) && isValidDateString(related) && (related as string) <= value;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be on or after ${args.constraints[0]}`;
  }
}

/** Validates that the property is a date on or after another property. */
export function IsDateAfterOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfterOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: DateAfterOrEqualConstraint,
    });
  };
}
