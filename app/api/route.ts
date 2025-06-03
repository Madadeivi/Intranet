// API routes working correctly
export async function GET() {
  return Response.json({ 
    message: 'API is working',
    routes: {
      health: '/api/health',
      login: '/api/users/login',
      test: '/api/test'
    },
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return Response.json({ 
    message: 'POST method also working',
    timestamp: new Date().toISOString()
  });
}