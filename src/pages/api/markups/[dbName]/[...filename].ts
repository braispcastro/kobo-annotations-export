import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = async ({ params }) => {
    const { dbName, filename } = params;

    if (!dbName || !filename) {
        return new Response('Not Found', { status: 404 });
    }

    // path.join handles the string filename
    const filePath = path.join(process.cwd(), 'data', dbName, 'markups', filename);

    if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
        const fileBuffer = fs.readFileSync(filePath);

        return new Response(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    return new Response('File Not Found', { status: 404 });
};
