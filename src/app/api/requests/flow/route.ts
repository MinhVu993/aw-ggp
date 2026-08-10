import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empno, location, app_code } = body;

    if (!empno) {
      return NextResponse.json({ success: false, error: 'empno is required' }, { status: 400 });
    }

    const res = await fetch('http://gmo021.cansportsvg.com:10003/api/ifm-tracking/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empno,
        location: location || 'vg',
        app_code: app_code || 'fac'
      })
    });

    const data = await res.json();

    let flowData: any[] = [];
    if (data.ok && data.result && Array.isArray(data.result.flow_data)) {
      flowData = data.result.flow_data;
    } else if (Array.isArray(data.flow_data)) {
      flowData = data.flow_data;
    }

    return NextResponse.json({
      success: true,
      data: flowData
    });
  } catch (error) {
    console.error('Error in POST /api/requests/flow:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
