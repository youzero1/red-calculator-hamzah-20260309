import { NextRequest, NextResponse } from 'next/server';
import 'reflect-metadata';
import { getDataSource } from '@/database/data-source';
import { Calculation } from '@/database/entities/Calculation';

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Calculation);
    const calculations = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: calculations });
  } catch (error) {
    console.error('GET /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, result } = body;

    if (!type || !input || !result) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, input, result' },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Calculation);

    const calculation = repo.create({
      type,
      input: JSON.stringify(input),
      result: JSON.stringify(result),
    });

    const saved = await repo.save(calculation);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('POST /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save calculation' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Calculation);
    await repo.clear();
    return NextResponse.json({ success: true, message: 'All calculations cleared' });
  } catch (error) {
    console.error('DELETE /api/calculations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear calculations' },
      { status: 500 }
    );
  }
}
