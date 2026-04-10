import {SignJWT,jwtVerify} from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "lifestack");
export async function generateJwt(payload:Record<string,any>):Promise<string>{
    const token:string = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

    return token;
}

export async function verifyJwt(token:string):Promise<Record<string,any>>{
    const {payload} = await jwtVerify(token,secret);
    return payload;
}