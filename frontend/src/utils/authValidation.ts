export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*\s).{8,16}$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]{1,79}$/u;
const COMPANY_REGEX = /^[\p{L}][\p{L}\d\s&'.-]{1,79}$/u;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  return MOBILE_REGEX.test(value.trim());
}

export function isValidName(value: string): boolean {
  return NAME_REGEX.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function isValidCompanyName(value: string): boolean {
  return COMPANY_REGEX.test(value.trim());
}

export function isValidFoundingYear(value: string): boolean {
  const year = Number(value);
  return (
    /^\d{4}$/.test(value) &&
    year >= 1900 &&
    year <= new Date().getFullYear()
  );
}

export function isValidBusinessRegNumber(value: string): boolean {
  return /^\d{5,12}$/.test(value.trim());
}
