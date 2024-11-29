import pdfParse from "pdf-parse";
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import fs from "fs/promises";
import { Document, Packer, Paragraph } from "docx";

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser for file uploads
  },
};

// Function to read the raw data from the request stream
async function readStreamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Function to extract text from a PDF buffer
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    //console.log("Extracted text:", data.text); // Log extracted text for debugging
    return data.text;
  } catch (error) {
    //console.error("Error extracting text from PDF:", error);
    throw new Error("Error extracting text from PDF");
  }
}

export async function POST(req: NextRequest) {
  //console.log("Received a request to /api/upload");

  try {
    //console.log("Parsing the form...");
    const nodeReq = Object.assign(req.body as unknown as Readable, req) as any;
    //console.log(nodeReq); //ReadableStream { locked: false, state: 'readable', supportsBYOB: true }
    // Read the request body as a Buffer
    const rawData = await readStreamToBuffer(nodeReq);
    //console.log("Raw data length:", rawData.length);

    // Extract the content-type header from the request (important for parsing multipart data)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Unsupported content type");
    }

    // Extract the boundary from the content-type
    const boundaryMatch = contentType.match(/boundary=([\w-]+)/);
    if (!boundaryMatch) {
      throw new Error("Boundary not found in content-type header");
    }
    const boundary = boundaryMatch[1];
    //console.log("Multipart boundary:", boundary);
    // Step 3: Split the raw data into parts based on the boundary
    function splitBufferByBoundary(buffer: Buffer, boundary: Buffer): Buffer[] {
      const parts: Buffer[] = [];
      let start = 0;

      // Iterate through the buffer and find the boundary
      for (let i = 0; i < buffer.length; i++) {
        if (buffer.slice(i, i + boundary.length).equals(boundary)) {
          // Push the part from the last position to the current position
          if (i > start) {
            parts.push(buffer.slice(start, i));
          }
          start = i + boundary.length; // Move start position past the boundary
          i += boundary.length - 1; // Skip the boundary length in the next iteration
        }
      }

      // Add the final part after the last boundary
      if (start < buffer.length) {
        parts.push(buffer.slice(start));
      }

      return parts;
    }

    // Create a Buffer from the boundary string
    const boundaryBuffer = Buffer.from(`--${boundary}`);

    // Split the raw data using the custom split function
    const parts = splitBufferByBoundary(rawData, boundaryBuffer).filter(
      (part) => part.length > 0
    );

    // Log the number of parts and the first part for debugging
    //console.log("Number of parts:", parts.length);
    //console.log("First part (raw):", parts[0].toString());
    // working till here

    const pdfBuffer = parts[0];
    const extractedText = await extractTextFromPdf(pdfBuffer); // Extract text from the PDF
    //console.log("final is :", extractedText);
    return NextResponse.json({ url: "fileUrl" });
  } catch (error) {
    //console.error("Unhandled error in /api/upload:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Generates a .doc file from text content and saves it to the specified path.
 * @param content - The text content to include in the .doc file.
 * @param outputPath - The file path where the .doc file will be saved.
 */
async function generateDoc(content: string, outputPath: string): Promise<void> {
  //console.log("Generating DOC file with provided content");

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: content.split("\n").map((line) => new Paragraph(line)),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    //console.log("DOC file buffer created");

    await fs.writeFile(outputPath, buffer);
    //console.log("DOC file written to disk at:", outputPath);
  } catch (err) {
    //console.error("Error in generateDoc function:", err);
    throw err;
  }
}
