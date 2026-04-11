import { Client } from "pg";
import { tableQueries } from "@/_lib/data/sql";
import pool from "@/_lib/config/db";


; (async () => {
    const masterLink = process.env.DB_LINK?.replace(/\/lifestack_production$/, '/postgres');
    const masterClient = new Client({ connectionString: masterLink });
    try {
        await masterClient.connect();

        // Check if medflow exists
        const dbCheck = await masterClient.query(
            "SELECT 1 FROM pg_database WHERE datname = 'lifestack'"
        );

        if (dbCheck.rowCount === 0) {
            console.log("🚀 Database 'medflow' not found. Creating it now...");
            // CREATE DATABASE cannot run inside a transaction
            await masterClient.query("CREATE DATABASE lifestack");
        }
    } catch (err) {
        console.error("❌ Failed to bootstrap database:", err);
        process.exit(1);
    } finally {
        await masterClient.end();
    }

    try {
        await pool.query("BEGIN");
        for (let { name, query } of tableQueries) {
            const result = await pool.query(query);
            if (result.command === "CREATE") console.log(`Table ${name} created.`)
        }
        await pool.query("COMMIT");
        console.log("🎉 All tables synchronized!");
    } catch (err) {
        console.log(String(err));
        await pool.query("ROLLBACK");
        process.exit(1);
    }
    finally {
        await pool.end();
        console.log("Database disconnected");
    }
})();