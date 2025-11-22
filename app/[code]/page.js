import { pool } from '@/lib/db';
import { redirect } from "next/navigation";

export  default async function RedirectPage({params}) {
    const {code} = params;

    try {
        const result = await pool.query ( `UPDATE links SET total_clicks = total_clicks + 1, last_clicked = NOW() WHERE code = $1 RETURNING target_url`, [code]);
        if (result.rowCount === 0) {
            return (<div style ={{ padding: "20px"}}><h1>404 - Short Link Not Found</h1></div>);
    }
        const url = result.rows[0].target_url;
        redirect(url);
    } catch (err) {
        return (<div style={{ padding: "20px"}}><h1>Error: {err.message}</h1></div>);
    }
}