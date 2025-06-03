export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return Response.json({ 
      message: 'Login working', 
      email: body.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: 'Invalid JSON' }, 
      { status: 400 }
    );
  }
}