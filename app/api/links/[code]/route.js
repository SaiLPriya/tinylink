import pool from '@/lib/db';

export async function GET(request, {params}) {
    const {code} = params;
    try {
        const result = await pool.query ("SELECT * FROM links WHERE code = $1", [code]);
        if (result.rowCount === 0) {
            return new Response(JSON.stringify({error: "Not found"}), {status: 404});
        }
        return new Response (JSON.stringify (result.rows[0]), {status: 200});
    } catch (err) {
        return new Response(JSON.stringify({error: err.message}), {status: 500});
    }
}
export async function DELETE(request, {params}) {
    const {code} = params;
    try {
        const result = await pool.query("DELETE FROM links WHERE code = $1 RETURNING *", [code]);
        if (result.rowCount === 0) {
            return new Response(JSON.stringify({error: "Not found"}), {status: 404});
        }
        return new Response(null, {status:204});    
    } catch (err) {
        return new Response(JSON.stringify({error: err.message}), {status: 500});
    }
}