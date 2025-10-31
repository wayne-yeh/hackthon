import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '沒有選擇文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只支持圖片文件' },
        { status: 400 }
      );
    }

    // 驗證文件大小（10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超過 10MB' },
        { status: 400 }
      );
    }

    // 創建 uploads 目錄（如果不存在）
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop();
    const fileName = `image-${timestamp}-${randomStr}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // 將文件轉換為 Buffer 並保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 返回圖片 URL
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('圖片上傳錯誤:', error);
    return NextResponse.json(
      { error: '上傳失敗: ' + error.message },
      { status: 500 }
    );
  }
}

