"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Replace with your ShadCN button import
import { Input } from "@/components/ui/input"; // Replace with your ShadCN input import
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Replace with your ShadCN card import
import { ThemeController } from "./theme-controller";
import heic2any from "heic2any";

export default function UploadAndGeneratePDF() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fileChanging, setFileChanging] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [isThereTemplate, setIsThereTemplate] = useState<boolean>(false);
  //   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (event.target.files) {
  //       const filesArray = Array.from(event.target.files);
  //       setSelectedFiles((prev) => [...prev, ...filesArray]);
  //     }
  //   };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const convertedFiles: File[] = [];

      for (const file of filesArray) {
        if (file.type === "image/heic") {
          try {
            setFileChanging(true);
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
            });

            // Ensure the result is a single Blob
            const finalBlob = Array.isArray(convertedBlob)
              ? convertedBlob[0]
              : convertedBlob;

            const convertedFile = new File(
              [finalBlob],
              file.name.replace(/\.heic$/i, ".jpeg"),
              {
                type: "image/jpeg",
              }
            );
            convertedFiles.push(convertedFile);
          } catch (error) {
            ////console.error("Error converting .HEIC file:", error);
            alert("Failed to convert HEIC file. Please try another format.");
          } finally {
            setFileChanging(false);
          }
        } else {
          convertedFiles.push(file);
        }
      }

      setSelectedFiles((prev) => [...prev, ...convertedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTemplate = (status: { status: boolean; template?: any }) => {
    setIsThereTemplate(status.status);

    if (status.template) {
      // Check if the template already exists in the selectedFiles array by comparing names or other unique properties
      const templateExists = selectedFiles.some(
        (file) => file.name === status.template.name
      );

      if (!templateExists) {
        setSelectedFiles((prev) => [...prev, status.template]);
      }
    }
  };

  const generatePDF = async () => {
    if (!isThereTemplate) {
      setError("Please select a template first.");
      return;
    }
    if (selectedFiles.length === 0) {
      setError("No files selected.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    try {
      const response = await fetch("/api/imagetopdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generated.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      //console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center lg:gap-10">
      <ThemeController onsuccess={updateTemplate} />
      <div className="p-6 max-w-4xl mx-auto">
        {isThereTemplate && (
          <p className="my-4">
            Your template is ready and will be printed in the first page of your
            pdf
          </p>
        )}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Upload Images and Generate PDF
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <Input
                type="file"
                accept="image/*,.heic"
                multiple
                onChange={handleFileChange}
                className="w-full"
              />

              {/* Selected Files Preview */}
              <div className="flex flex-wrap gap-4 mt-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-32 h-32 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      onClick={() => removeFile(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate PDF Button */}
              <Button
                className="mt-4 w-full"
                onClick={generatePDF}
                disabled={
                  isGenerating || selectedFiles.length === 0 || fileChanging
                }
              >
                {fileChanging
                  ? "Rendering Images"
                  : isGenerating
                  ? "Generating PDF..."
                  : "Generate PDF"}
              </Button>

              {/* Error Message */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
