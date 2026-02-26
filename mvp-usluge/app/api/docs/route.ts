import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const swaggerFile = path.join(process.cwd(), 'public', 'swagger.json');
        if (fs.existsSync(swaggerFile)) {
            const fileContents = fs.readFileSync(swaggerFile, 'utf8');
            return NextResponse.json(JSON.parse(fileContents));
        } else {
            return NextResponse.json({ error: "Swagger spec not generated in public folder. Please run generator script." }, { status: 404 });
        }
    } catch (e) {
        return NextResponse.json({ error: "Swagger spec read failed" }, { status: 500 });
    }
}
