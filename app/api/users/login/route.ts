import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt:', body);
    
    return NextResponse.json({ 
      message: 'Login endpoint working', 
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' }, 
      { status: 400 }
    );
  }
}