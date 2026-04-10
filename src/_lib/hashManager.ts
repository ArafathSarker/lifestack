import bcrypt from "bcrypt";

export async function generateHash(password:string):Promise<string>{
const hash = await bcrypt.hash(password,10);
   return hash;
}


export const compareHash = async (passwrod:string,hash:string):Promise<boolean>=>{
   const is_ture = bcrypt.compare(passwrod,hash);
   return is_ture;
}