import pool from "@/_lib/config/db";
import { generateHash } from "@/_lib/hashManager";

export async function POST(request:Request)
{
    const {fullName,email,password,confirmPassword,agreeToTerms} = await request.json();
    try{
           const result = await pool.query(`SELECT * FROM users WHERE email=$1;`,[email]);
           if(result.rowCount !== 0) return Response.json({
            status:401,
            message:"User already exist",
            success:false
           });

           if(password !== confirmPassword) return Response.json({
              message:"Password do not matched",
              success:false,
           });
           if(!agreeToTerms) return Response.json({
                    success:false,
                    message:"Agree to the terms and conditions",
           });
            const pass_hash = await generateHash(password);
            const {rows} = await pool.query(`INSERT INTO users (full_name,email,password_hash)
                VALUES 
                ($1,$2,$3) RETURNING id;`,[fullName,email,pass_hash]);
            return Response.json({
                success:true,
                message:"User registered",
                data:{
                    id:rows[0].id,
                    name:fullName,
                    email
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