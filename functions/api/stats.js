// functions/api/stats.js
// GET: Dashboard statistics

export async function onRequest(context) {
    const { env } = context;
    
    try {
        // Get total students
        const total = await env.DB.prepare("SELECT COUNT(*) as count FROM students").first();
        
        // Get total collected payments
        const collected = await env.DB.prepare("SELECT SUM(paid) as total FROM students").first();
        
        // Get total due payments
        const due = await env.DB.prepare("SELECT SUM(due) as total FROM students").first();
        
        // Get fully paid students count
        const fullyPaid = await env.DB.prepare("SELECT COUNT(*) as count FROM students WHERE due = 0").first();
        
        // Get active students
        const active = await env.DB.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'Active'").first();
        
        return new Response(JSON.stringify({
            totalStudents: total.count || 0,
            totalCollected: collected.total || 0,
            totalDue: due.total || 0,
            fullyPaid: fullyPaid.count || 0,
            activeStudents: active.count || 0
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
