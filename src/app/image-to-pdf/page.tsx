"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Replace with your ShadCN button import
import { Input } from "@/components/ui/input"; // Replace with your ShadCN input import
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Replace with your ShadCN card import
import { ThemeController } from "./theme-controller";
import { toast } from "@/hooks/use-toast";

export default function UploadAndGeneratePDF() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fileChanging, setFileChanging] = useState<boolean>(false);
  const [clickedImage, setClickedImage] = useState<number>(0);
  const [isThereTemplate, setIsThereTemplate] = useState<boolean>(false);
  let heic2any: any;

  useEffect(() => {
    // Dynamically import heic2any on the client side
    if (typeof window !== "undefined") {
      import("heic2any")
        .then((module) => {
          heic2any = module.default;
        })
        .catch((err) => {
          console.error("Failed to load heic2any:", err);
        });
    }
  }, []);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (typeof window === "undefined") {
      console.error("window is not defined.");
      return;
    }
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const convertedFiles: File[] = [];

      for (const file of filesArray) {
        console.log("File type is :", file.type);
        if (file.type === "image/heic") {
          try {
            setFileChanging(true);
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
            });
            console.log("converted blog is :", convertedBlob);
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
          } catch (error: any) {
            console.error("Error converting .HEIC file:", error.message);
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
    setIsGenerating(true);

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
      toast({
        className: "bg-green-700 text-white font-bold",
        title: "Success",
        description: "Your pdf is ready to preview",
      });
    } catch (error: any) {
      //console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClickImage = (ind: number) => {
    if (clickedImage === 0) {
      setClickedImage(ind);
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
                      onClick={() => handleClickImage(index + 1)}
                    />
                    {clickedImage === index + 1 && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 py-10 px-2">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="max-w-full max-h-full rounded relative"
                        />
                        <Button
                          className="absolute top-2 right-2 rounded-full"
                          size={"icon"}
                          onClick={() => setClickedImage(0)}
                        >
                          {" "}
                          &times;
                        </Button>
                      </div>
                    )}

                    <Button
                      size={"icon"}
                      className="absolute top-1 right-1 rounded-full"
                      onClick={() => removeFile(index)}
                    >
                      &times;
                    </Button>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
