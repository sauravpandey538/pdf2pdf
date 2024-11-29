"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; // Replace with your ShadCN button import
import { Input } from "@/components/ui/input"; // Replace with your ShadCN input import
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Replace with your ShadCN card import

interface ThemeControllerPrope {
  onsuccess: (status: { status: boolean; template?: File }) => void;
}

export const ThemeController: React.FC<ThemeControllerPrope> = ({
  onsuccess,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    semester: "",
    section: "",
    LCIDNumber: "",
    teacherName: "",
    subjectName: "",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleCanvasDataURL = (dataURL: string) => {
    // Extract the file type and base64 content from the data URL
    const [metadata, base64Content] = dataURL.split(",");
    const mimeType = metadata.match(/:(.*?);/)?.[1] || "image/png";

    // Convert the base64 content into a byte array
    const byteString = atob(base64Content);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    // Create a new File object from the byte array
    const file = new File([byteArray], "canvas-image.png", { type: mimeType });
    return file;
    // Update the state with the new File object
    // setSelectedFiles((prev) => [...prev, file]);
  };

  const handleTemplateSelect = (template: number) => {
    setSelectedTemplate(template);
  };

  // useEffect(() => {
  //   if (selectedTemplate) {
  //     drawCanvas(selectedTemplate);
  //   }
  // }, [formData, selectedTemplate]);
  const lineHeight = 50; // Space between lines, adjust this as needed

  const wrapText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    ctx: CanvasRenderingContext2D
  ) => {
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];

    // Loop through each word and add it to a line, checking if the line exceeds maxWidth
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line); // Push the remaining line

    // Draw each line on the canvas
    lines.forEach((line, index) => {
      const lineWidth = ctx.measureText(line).width;

      // If the line width is less than maxWidth, center it
      const centeredX = x + (maxWidth - lineWidth) / 2;

      ctx.fillText(line, centeredX, y + index * lineHeight);
    });
  };

  const drawCanvas = (template: number) => {
    if (Object.values(formData).some((field) => field.trim() === "")) {
      alert("Please add all fields");
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src =
      template === 1
        ? "/temp1.png"
        : "https://officetemplatesonline.com/wp-content/uploads/2021/04/educational-assignment-cover-page-template-for-ms-word.jpg";

    const date = new Date(Date.now());

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    // semister map
    const semister = [
      "1'st",
      "2'nd",
      "3'rd",
      "4'th",
      "5'th",
      "6'th",
      "7'th",
      "8'th",
    ];

    // Combine them into the desired format
    const formattedDate = `${year}/${month}/${day}`;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.font = "20px Arial";
      ctx.fillStyle = "black";

      ctx.fillText(`Name: ${formData.name}`, 250, 700);
      ctx.fillText(
        `Semester: ${semister[Number(formData.semester) - 1]}`,
        250,
        740
      );
      ctx.fillText(`Section: ${formData.section}`, 250, 780);
      ctx.fillText(`LCID: ${formData.LCIDNumber}`, 250, 820);

      // footer
      ctx.fillText(`${formData.teacherName}`, 445, 910);

      ctx.fillText(`${formattedDate}`, 365, 935);

      ctx.font = "40px Arial"; // Larger font size for emphasis
      wrapText(`${formData.subjectName}`, 180, 500, 500, ctx);
      //console.log("url is :", canvas.toDataURL("image/png"));
      setCanvasDataUrl(canvas.toDataURL("image/png"));
    };
  };
  const handleSubmit = () => {
    if (canvasDataUrl) {
      const file = handleCanvasDataURL(canvasDataUrl);
      onsuccess({ status: true, template: file });
    } else {
      onsuccess({ status: false });
    }
  };

  return (
    <div className="max-w-4xl my-10">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Choose a Template</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template Selection */}
            <div className="flex justify-around mt-4 gap-3">
              {[
                "https://officetemplatesonline.com/wp-content/uploads/2021/04/assignment-cover-page-template-for-ms-word.jpg",
                "https://officetemplatesonline.com/wp-content/uploads/2021/04/educational-assignment-cover-page-template-for-ms-word.jpg",
              ].map((template, index) => (
                <div
                  key={index}
                  className={`h-96 w-72 overflow-hidden cursor-pointer ${
                    index + 1 === selectedTemplate && "border-4 border-blue-500"
                  }`}
                  onClick={() => handleTemplateSelect(index + 1)}
                >
                  <img src={template} alt={`Template ${index + 1}`} />
                </div>
              ))}
            </div>

            {/* Form and Canvas Preview */}
            {selectedTemplate && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Enter Student Details</h3>
                <form className="space-y-4">
                  {[
                    { name: "name", placeholder: "eg:John Doe" },
                    { name: "semester", placeholder: "eg: 1" },
                    { name: "section", placeholder: "eg: A" },
                    {
                      name: "LCIDNumber",
                      placeholder: "eg: LCID00017002801",
                    },
                    {
                      name: "teacherName",
                      placeholder: "eg: Jane Doe",
                    },
                    { name: "subjectName", placeholder: "eg: Math" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block font-medium">
                        {field.name.charAt(0).toUpperCase() +
                          field.name.slice(1)}
                      </label>
                      <Input
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </form>
                <div className="mt-6">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={1000}
                    className="hidden"
                  />
                  <Button
                    onClick={() => {
                      drawCanvas(selectedTemplate);
                      handleSubmit();
                    }}
                    className="mt-4"
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

{
  /* Canvas Preview */
}
{
  /* <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-medium">Live Canvas Preview</h2>
                  {canvasDataUrl ? (
                    <img
                      src={canvasDataUrl}
                      alt="Canvas preview"
                      className="border rounded-lg max-w-full h-auto"
                    />
                  ) : (
                    <p className="text-gray-500">Preview will appear here.</p>
                  )}
                </div> */
  // const canvas = canvasRef.current;
  // if (canvas) {
  //   const link = document.createElement("a");
  //   link.download = "assignment-cover.png";
  //   link.href = canvas.toDataURL("image/png");
  //   link.click();
  // }
}

{
  /* Canvas and Download Button */
}
{
}
