import { pool } from "@/lib/db";

export async function POST(request) {
    try {
        const body = await request.json();
        const {target_url, code} = body;  

    if (!target_url) {
        return new Response(JSON.stringify({error: "target_url is required"}), {status: 400});
    }
    try {
        new URL(target_url);
    } catch {
        return new Response(JSON.stringify({error: "Invalid URL"}), {status: 400});
    }

    const finalCode = code || generateCode();
    if (!/^[a-zA-Z0-9_-]{6,8}$/.test(finalCode)) {
        return new Response(JSON.stringify({error: "Code must be 6-8 alphanumeric characters"}), {status: 400});
    }

    const exists = await pool.query("SELECT 1 FROM links WHERE code = $1", [finalCode]);
    if (exists.rowCount > 0) {
        return new Response(JSON.stringify({error: "Code already in exists"}), {status: 409});
    }

    await pool.query(
        "INSERT INTO links (code, target_url) VALUES ($1, $2)",
        [finalCode, target_url]
    );
    return new Response(JSON.stringify({code: finalCode, target_url}), {status: 201});
    } catch (err) {
        return new Response(JSON.stringify({error: err.message}), {status: 500});
    }
}

export async function GET() {
    try {
        const result = await pool.query("SELECT* FROM links ORDER BY created_at DESC");
        return new Response(JSON.stringify(result.rows), {status: 200});
    } catch (err) {
        return new Response(JSON.stringify({error: err.message}), {status: 500});
    }
}

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}