// functions/api/students.js
// GET: Fetch all students
// POST: Register new student

export async function onRequest(context) {
    const { request, env } = context;
    
    // ============================================
    // GET - Fetch all students from database
    // ============================================
    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare(`
                SELECT student_id, full_name, phone, gender, course, 
                       paid, due, registration_date, status 
                FROM students 
                ORDER BY id DESC
            `).all();
            
            return new Response(JSON.stringify(result.results), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
    
    // ============================================
    // POST - Register a new student
    // ============================================
    if (request.method === 'POST') {
        try {
            const { fullName, phone, gender, course, emergencyContact, paid } = await request.json();
            
            // Generate student ID
            const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM students").first();
            const studentId = `LBC${new Date().getFullYear()}${(countResult.count + 1).toString().padStart(4, '0')}`;
            
            // Course fees
            const courseFees = {
                'Hairdressing & Styling': 15000,
                'Makeup Artistry': 12000,
                'Nail Technology': 8000,
                'Skin Care & Aesthetics': 18000,
                'Beauty Therapy': 20000
            };
            
            const totalFee = courseFees[course] || 10000;
            const paidAmount = parseFloat(paid) || 0;
            const dueAmount = totalFee - paidAmount;
            
            // Insert into database
            await env.DB.prepare(`
                INSERT INTO students (student_id, full_name, phone, gender, course, emergency_contact, paid, due, total_fee)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(studentId, fullName, phone, gender, course, emergencyContact, paidAmount, dueAmount, totalFee).run();
            
            return new Response(JSON.stringify({ 
                success: true, 
                studentId: studentId,
                totalFee: totalFee,
                paid: paidAmount,
                due: dueAmount
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
    
    return new Response('Method not allowed', { status: 405 });
}
