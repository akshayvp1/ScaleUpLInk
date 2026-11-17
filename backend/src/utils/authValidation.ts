export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*\s).{8,16}$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]{1,79}$/u;
const COMPANY_REGEX = /^[\p{L}][\p{L}\d\s&'.-]{1,79}$/u;

export interface RegistrationPayload {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  contactNumber?: string;
  role?: string;
  companyName?: string;
  companyFounded?: string | number;
  businessRegNumber?: string | number;
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeContactNumber(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRegistrationPayload(
  payload: RegistrationPayload
): string | null {
  if (!payload || typeof payload !== "object") {
    return "Registration details are required.";
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) return "Name is required.";
  if (!NAME_REGEX.test(name)) {
    return "Name must be 2-80 characters and use only letters, spaces, hyphens, apostrophes or periods.";
  }

  const email = normalizeEmail(payload.email);
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address.";

  const contactNumber = normalizeContactNumber(payload.contactNumber);
  if (!contactNumber) return "Mobile number is required.";
  if (!MOBILE_REGEX.test(contactNumber)) {
    return "Mobile number must be 10 digits and start with 6, 7, 8 or 9.";
  }

  if (!payload.password) return "Password is required.";
  if (!PASSWORD_REGEX.test(payload.password)) {
    return "Password must be 8-16 characters with uppercase, lowercase, a number and one of !@#$%^&*, with no spaces.";
  }
  if (payload.password !== payload.confirmPassword) {
    return "Passwords do not match.";
  }

  if (payload.role !== "entrepreneur" && payload.role !== "investor") {
    return "Select a valid account type.";
  }

  if (payload.role === "investor") {
    const companyName =
      typeof payload.companyName === "string" ? payload.companyName.trim() : "";
    if (!companyName) return "Company name is required.";
    if (!COMPANY_REGEX.test(companyName)) return "Enter a valid company name.";

    const companyFounded = Number(payload.companyFounded);
    const currentYear = new Date().getFullYear();
    if (!payload.companyFounded || !Number.isInteger(companyFounded)) {
      return "Company founding year is required.";
    }
    if (companyFounded < 1900 || companyFounded > currentYear) {
      return `Company founding year must be between 1900 and ${currentYear}.`;
    }

    const businessRegNumber = String(payload.businessRegNumber ?? "").trim();
    if (!businessRegNumber) return "Business registration number is required.";
    if (!/^\d{5,12}$/.test(businessRegNumber)) {
      return "Business registration number must contain 5-12 digits.";
    }
  }

  return null;
}

export function validateLoginPayload(
  emailValue: unknown,
  password: unknown
): string | null {
  const email = normalizeEmail(emailValue);
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address.";
  if (typeof password !== "string" || !password) return "Password is required.";
  return null;
}

export function validateOtpPayload(
  emailValue: unknown,
  otp: unknown
): string | null {
  const email = normalizeEmail(emailValue);
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address.";
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return "Enter a valid 6-digit OTP.";
  }
  return null;
}

export function validateEmailPayload(emailValue: unknown): string | null {
  const email = normalizeEmail(emailValue);
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address.";
  return null;
}
