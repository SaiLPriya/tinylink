export async function GET() {
    return new Response (JSON.stringify({ ok: true, status: "healthy"}),
    {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
        }
    );
 }