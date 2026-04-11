import { Pool } from "pg";
declare global {
    var pgPool: Pool | undefined;
}


if (!globalThis.pgPool) {
    globalThis.pgPool = new Pool({
        connectionString: process.env.DB_LINK,
        ssl: { rejectUnauthorized: false },
    });
}

const pool: Pool = globalThis.pgPool;
export default pool;
