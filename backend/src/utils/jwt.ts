


import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in .env file");
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: "entrepreneur" | "investor"|"admin";
  exp?: number;
  iat?: number;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const PASSWORD_RESET_PURPOSE = "password-reset";

interface PasswordResetTokenPayload {
  email: string;
  purpose: typeof PASSWORD_RESET_PURPOSE;
}

// Generate a short-lived token that can only be used to reset a password
export const generatePasswordResetToken = (email: string): string => {
  return jwt.sign(
    { email, purpose: PASSWORD_RESET_PURPOSE },
    JWT_ACCESS_SECRET,
    { expiresIn: "10m" }
  );
};

export const verifyPasswordResetToken = (
  token: string
): Promise<PasswordResetTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
      const payload = decoded as Partial<PasswordResetTokenPayload> | undefined;

      if (
        err ||
        !payload ||
        payload.purpose !== PASSWORD_RESET_PURPOSE ||
        typeof payload.email !== "string"
      ) {
        reject(new Error("Invalid or expired password reset token"));
        return;
      }

      resolve({ email: payload.email, purpose: PASSWORD_RESET_PURPOSE });
    });
  });
};

// Generate Access & Refresh Tokens
export const generateToken = (payload: ITokenPayload): Tokens => {
  try {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Failed to generate token: ${(error as Error).message}`);
  }
};

// Verify Access Token (Async)
export const verifyAccessToken = (token: string): Promise<ITokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        reject(new Error("Invalid or expired access token"));
      } else {
        resolve(decoded as ITokenPayload);
      }
    });
  });
};

// Verify Refresh Token (Async)
export const verifyRefreshToken = (token: string): Promise<ITokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(new Error("Invalid or expired refresh token"));
      } else {
        resolve(decoded as ITokenPayload);
      }
    });
  });
};

// Refresh Access Token Using Refresh Token
export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as ITokenPayload;
    const { id, email, role } = decoded;

    return jwt.sign({ id, email, role }, JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
  }
};
