import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib"; // Import pdf-lib
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const files: File[] = [];

    // Collect all files
    data.forEach((value, key) => {
      if (value instanceof File) {
        files.push(value);
      }
    });

    if (files.length === 0) {
      return NextResponse.json(
        { message: "No files uploaded" },
        { status: 404 }
      );
    }

    // Initialize a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Padding value (you can adjust this to increase/decrease the space around the image)
    const padding = 30;

    // Iterate through each file, add them as images to the PDF
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let jpegBuffer: Buffer;
      try {
        jpegBuffer = await sharp(buffer)
          .jpeg() // Convert to JPEG
          .toBuffer();
      } catch (error) {
        return NextResponse.json(
          { message: "Error converting image to JPEG" },
          { status: 400 }
        );
      }
      const image = await pdfDoc.embedJpg(jpegBuffer);

      // const image = await pdfDoc.embedJpg(buffer); // Use embedPng if you have PNG images
      const { width, height } = image.size();

      // Create a new page with the same size as an A4 paper (in points)
      const page = pdfDoc.addPage([595.276, 841.89]); // A4 size in points

      // Calculate the new image dimensions with padding
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const imageWidth = pageWidth - 2 * padding; // Subtract padding from both sides
      const imageHeight = (height / width) * imageWidth; // Scale image while maintaining aspect ratio

      // Ensure the image fits inside the page with the padding
      const yOffset = (pageHeight - imageHeight) / 2; // Center the image vertically
      const xOffset = padding; // Apply padding to the left side

      page.drawImage(image, {
        x: xOffset,
        y: yOffset,
        width: imageWidth,
        height: imageHeight,
      });
    }

    // Serialize the PDF document
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="generated.pdf"`,
      },
    });
  } catch (error) {
    //console.error("Error generating PDF:", error);
    return NextResponse.json({ message: "Error Server" }, { status: 500 });
  }
}
