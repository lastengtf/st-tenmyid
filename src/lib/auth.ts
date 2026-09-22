import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "st_admin_session";

function getAuthSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "rahasia_st_ten_my_id_super_secure_default_key_32chars!";
  return new TextEncoder().encode(secret.padEnd(32, "!").slice(0, 32));
}

export interface SessionPayload {
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@st.ten.my.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "adminst12345!";

  if (!emailInput || !passwordInput) return false;

  const isEmailMatch =
    emailInput.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const isPasswordMatch = passwordInput === adminPassword;

  return isEmailMatch && isPasswordMatch;
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const secretKey = getAuthSecretKey();
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return token;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secretKey = getAuthSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentAdminSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) return null;

    return await verifySessionToken(tokenCookie.value);
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
