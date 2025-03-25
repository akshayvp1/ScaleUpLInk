import jwt from "jsonwebtoken";


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET 

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in .env file");
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: "entrepreneur" | "investor";
  exp?: number;
  iat?: number;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Generate Access & Refresh Tokens
export const generateTokens = (payload: ITokenPayload): Tokens => {
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

// ✅ Verify Access Token
export const verifyAccessToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as ITokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as ITokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Refresh Access Token Using Refresh Token
export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const { id, email, role } = decoded;

    return jwt.sign({ id, email, role }, JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
  }
};
