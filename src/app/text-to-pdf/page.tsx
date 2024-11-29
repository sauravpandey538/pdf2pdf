"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Card } from "@/components/ui/card"; // ShadCN Card
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const validateFileName = (fileName: string) => {
  // Check if the file name contains a dot (.) and that it ends with .pdf
  const fileExtension = fileName.split(".").pop(); // Get the extension after the last dot

  if (!fileName || !fileExtension) {
    alert("Please provide a valid file name with an extension.");
    return false;
  }

  if (fileExtension.toLowerCase() !== "pdf") {
    alert("Error: File must be a PDF.");
    return false;
  }

  return true;
};

const EditablePDFCarousel = () => {
  const [content, setContent] = useState<string | null>("");
  const [pages, setPages] = useState<string[]>([]); // Store paginated content
  const [activeIndex, setActiveIndex] = useState(0); // Active carousel slide
  const [fileName, setFileName] = useState<string | null>(null);

  // PDF settings
  const pageHeightMM = 297; // A4 page height in mm
  const pageWidthMM = 210; // A4 page width in mm
  const marginMM = 10; // Margin in mm
  const fontSizePT = 12; // Font size in pt
  const lineHeightMM = 4.233; // Approximate line height in mm for 12pt font
  const contentWidthMM = pageWidthMM - 2 * marginMM;

  const textareaStyle = {
    width: `min(${contentWidthMM * 3.78 + 2 * marginMM * 3.78 + 2}px, 100%)`, // Ensures it doesn't exceed screen width
    height: `${(pageHeightMM - 2 * marginMM) * 3.78}px`, // Height in pixels
    padding: `${marginMM * 3.78}px`, // Padding in pixels
    fontSize: "12pt", // Matches PDF font size
    lineHeight: "1.3", // Matches PDF line height
  };

  const router = useRouter();

  // Split content into pages
  useEffect(() => {
    const doc = new jsPDF();
    doc.setFontSize(fontSizePT);

    const lines = doc.splitTextToSize(content!, contentWidthMM);
    const linesPerPage = Math.floor(
      (pageHeightMM - 2 * marginMM) / lineHeightMM
    );
    const pages = [];

    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage).join("\n"));
    }

    setPages(pages);
  }, [content]);

  const handleContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const updatedPages = [...pages];
    updatedPages[index] = e.target.value;
    setPages(updatedPages);
    setContent(updatedPages.join("\n")); // Update full content
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value); // Update file name if input is provided
  };

  const generatePDF = () => {
    if (fileName) {
      if (!validateFileName(fileName)) {
        return;
      }
    }
    const doc = new jsPDF();
    doc.setFontSize(fontSizePT);

    pages.forEach((pageContent, index) => {
      if (index > 0) doc.addPage(); // Add a new page if it's not the first one
      const lines = doc.splitTextToSize(pageContent, contentWidthMM);
      let cursorY = marginMM; // Starting position from the top of the page

      lines.forEach((line: any) => {
        doc.text(line, marginMM, cursorY); // Add text with a specified Y-position
        cursorY += lineHeightMM; // Move down by the line height for the next line
      });
    });

    doc.save(fileName || "myFilename.pdf"); // Use dynamic file name
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-4 ">
      <Card className="p-8 shadow-lg rounded-xl max-w-4xl w-full border border-gray-200 text-muted-foreground h-full mx-2 sm:mx-4">
        <div className="flex items-center w-full">
          <Button
            onClick={() => router.push("/")}
            className="w-full md:w-auto px-6 py-3 mx-5 bg-green-500 hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
          >
            Go Back
          </Button>
        </div>
        <p className="text-xl md:text-2xl font-semibold text-left my-2 mt-10">
          Write Your Content
        </p>
        <p className="text-left mb-6 text-sm">
          You can edit the text for each page of your PDF in the provided text
          areas. Type your desired content, making sure to give it a name to
          save it as a PDF on your device.
        </p>
        <div className="flex flex-col space-y-6 w-full overflow-auto">
          {pages.map((pageContent, index) => (
            <div key={index} className="flex flex-col justify-start space-y-2">
              <p className="text-lg font-semibold text-center">
                Page {index + 1}
              </p>
              <div className="overflow-auto">
                <textarea
                  value={pageContent}
                  onChange={(e) => handleContentChange(e, index)}
                  placeholder={`Edit Page ${index + 1}`}
                  className="resize-none border border-gray-300 rounded-lg outline-none bg-white text-gray-800 w-full h-[60vh] max-h-96 p-4 focus:ring-2 focus:ring-blue-500"
                  // style={textareaStyle} // Match dimensions with PDF
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between mt-6 space-y-4 md:space-y-0 md:space-x-4 w-full px-5">
          <Input
            value={fileName!}
            onChange={handleFileNameChange}
            placeholder="Eg: myfilename.pdf"
            className="w-full md:w-[300px] py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={generatePDF}
            className="w-full md:w-auto px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditablePDFCarousel;
