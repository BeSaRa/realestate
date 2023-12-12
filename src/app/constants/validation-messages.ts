import { ValidationMessageContract } from '@contracts/validation-message-contract';

export const ValidationMessages: Record<string, ValidationMessageContract> = {
  required: { key: 'required_field' },
  AR_NUM: { key: 'only_arabic_letters_and_numbers' },
  ENG_NUM: { key: 'only_english_letters_and_numbers' },
  smallerThanFromValue: { key: 'smaller_than_from_value' },
  largerThanToValue: { key: 'larger_than_to_value' },
  maxValue: { key: 'max_value' },
  minValue: { key: 'min_value' },
  maxLength: { key: 'max_length' },
  LDAP_USERNAME: { key: 'only_english_letters_numbers_underscores_and_hyphens' },
  password_and_password_confirm_should_be_equal: { key: 'password_and_password_confirm_should_be_equal' },
};

export type ValidationMessagesType = typeof ValidationMessages;
