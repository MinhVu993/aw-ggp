import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'goods_out', yearMonth);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === 'string' || !file.arrayBuffer) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension
      let ext = '.jpg';
      if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.name && file.name.includes('.')) {
        ext = path.extname(file.name).toLowerCase() || '.jpg';
      }

      const fileName = `${Date.now()}_${randomUUID().slice(0, 8)}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/goods_out/${yearMonth}/${fileName}`);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error: any) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải ảnh lên: ' + error.message }, { status: 500 });
  }
}
