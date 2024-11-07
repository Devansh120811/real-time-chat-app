import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    const { localFilePath } = await req.json(); // Extract localFilePath from the request body
    console.log(localFilePath);

    // Validate localFilePath
    if (!localFilePath || !fs.existsSync(localFilePath)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid file path or file does not exist',
            },
            {
                status: 400,
            }
        );
    }

    // Set headers to treat the response as a downloadable file
    const fileName = path.basename(localFilePath); // Get the file name from the local file path
    const contentType = 'application/pdf'; // Set the appropriate content type for the file

    // Create a ReadableStream for the local file
    const fileStream = fs.createReadStream(localFilePath);

    // Convert the ReadStream to a ReadableStream
    const stream = new ReadableStream({
        start(controller) {
            fileStream.on('data', chunk => controller.enqueue(chunk));
            fileStream.on('end', () => controller.close());
            fileStream.on('error', err => {
                console.error('Error reading file:', err);
                controller.error(err);
            });
        }
    });

    // Return the response with headers and the stream
    return new NextResponse(stream, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
        },
    });
}
