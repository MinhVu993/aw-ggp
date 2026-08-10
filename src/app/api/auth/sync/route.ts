import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In GGP, we don't have a local users table yet.
    // We just return success and let the frontend use the portal ID or empno.
    return NextResponse.json({ 
      success: true, 
      localId: body.empno || '1' // Fallback to empno or 1
    });
  } catch (error) {
    console.error('Error in POST /api/auth/sync:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
