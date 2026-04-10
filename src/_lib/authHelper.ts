import { cookies } from "next/headers";
import { verifyJwt } from "./jwtManager";

export async function getAuthUser(): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = await verifyJwt(token);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json(
    { success: false, message: "Unauthorized. Please log in." },
    { status: 401 }
  );
}
