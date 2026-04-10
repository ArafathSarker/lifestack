import pool from "@/_lib/config/db";
import { compareHash } from "@/_lib/hashManager";
import { generateJwt } from "@/_lib/jwtManager";
import { cookies } from "next/headers";

export async function POST(request:Request){
    const {email,password} = await request.json();
    try{
        const result = await pool.query(`SELECT * FROM users WHERE email=$1;`,[email]);
        if(result.rowCount === 0) return Response.json({
           success:false,
           message:"Please sign up!"
        });
        const is_true:boolean = await compareHash(password,result.rows[0].password_hash);
        if(!is_true) return Response.json({
              status:401,
              success:false,
              message:"Password is incorrect!"
        });
       const token:string = await generateJwt({
            id:result.rows[0].id,
            name:result.rows[0].full_name,
            email:result.rows[0].email
       });
      const cookieStore = await cookies();
      cookieStore.set("token",token,{
         httpOnly:true,
         secure:process.env.IS_PRODUCTION === "yes",
         sameSite:"strict",
         path: "/",
         maxAge: 60 * 60 * 24 * 7,
      });

      return Response.json({
        success:true,
        message:"Logged in successfully",
        data:{
            id:result.rows[0].id,
            name:result.rows[0].full_name,
            email:result.rows[0].email
        }
      });

    }
    catch(err)
    {
        return Response.json({
               status:500,
               message:String(err)
        });
    }
}