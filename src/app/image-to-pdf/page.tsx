"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Document, Page, Image, StyleSheet, pdf } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
import pica from "pica";
import { ThemeController } from "./theme-controller";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
  },
  image: {
    width: "100%",
    height: "auto",
    marginBottom: 10,
  },
});

const UploadAndGeneratePDF: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileName, setFileName] = useState("generated.pdf");
  const [isRendering, setIsRendering] = useState(false);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsRendering(true);
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      try {
        const convertedFiles = await Promise.all(
          filesArray.map(async (file) => {
            try {
              if (file.type === "image/heic") {
                if (typeof window !== "undefined") {
                  const heic2any = require("heic2any");

                  const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                  });
                  // testingg
                  const finalBlob = Array.isArray(convertedBlob)
                    ? convertedBlob[0]
                    : convertedBlob;
                  return new File(
                    [finalBlob],
                    file.name.replace(/\.heic$/i, ".jpeg"),
                    {
                      type: "image/jpeg",
                    }
                  );
                }
              } else {
                return await resizeAndConvertToJPEG(file);
              }
            } catch (error) {
              console.error(`Error processing file: ${file.name}`, error);
              toast({
                variant: "destructive",
                title: "File Conversion Error",
                description: `Could not convert file: ${file.name}. Skipping...`,
              });
              return null;
            }
          })
        );

        // Remove any files that failed conversion
        const validFiles = convertedFiles.filter(
          (file) => file !== null
        ) as File[];
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      } catch (error) {
        console.error("Error converting files:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process some files. Please try again.",
        });
      }
    }
    setIsRendering(false);
  };

  const resizeAndConvertToJPEG = async (file: File): Promise<File> => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxWidth = 1024; // Resize to max width (optional)
    const scaleFactor = maxWidth / img.width;

    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;

    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

    const picaInstance = pica();
    const blob = await picaInstance.toBlob(canvas, "image/jpeg", 0.9); // Resize and convert to JPEG
    return new File([blob], file.name.replace(/\..+$/, ".jpeg"), {
      type: "image/jpeg",
    });
  };

  const generatePDF = async () => {
    const pdfFilenameRegex = /^[a-zA-Z0-9_-]+\.pdf$/;
    if (!pdfFilenameRegex.test(fileName)) {
      return toast({
        variant: "destructive",
        title: "Invalid Filename",
        description: "Please provide a valid filename ending in .pdf.",
      });
    }

    setIsGenerating(true);

    const MyDocument = () => (
      <Document>
        {selectedFiles.map((file, index) => (
          <Page size="A4" style={styles.page} key={index}>
            <Image
              key={index}
              src={URL.createObjectURL(file)}
              style={styles.image}
            />
          </Page>
        ))}
      </Document>
    );

    try {
      const blob = await pdf(<MyDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        className: "bg-green-700 text-white font-bold",
        title: "Success",
        description: "Your PDF is ready to download!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const updateTemplate = (status: { status: boolean; template?: any }) => {
    if (status.template) {
      // Check if the template already exists in the selectedFiles array by comparing names or other unique properties
      const templateExists = selectedFiles.some(
        (file) => file.name === status.template.name
      );

      if (!templateExists) {
        setSelectedFiles((prev) => [status.template, ...prev]);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center lg:gap-10">
      <ThemeController onsuccess={updateTemplate} />

      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Upload Images and Generate PDF
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*, .heic"
                multiple
                onChange={handleFileChange}
                className="w-full"
              />
              <Input
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                className="w-full"
                placeholder="e.g., document.pdf"
              />

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
                    <Button
                      size="icon"
                      className="absolute top-1 right-1 rounded-full"
                      onClick={() => removeFile(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={generatePDF}
                disabled={
                  isGenerating || selectedFiles.length === 0 || isRendering
                }
              >
                {isRendering
                  ? "Rendering Image..."
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
};

export default UploadAndGeneratePDF;
