"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Document,
  Page,
  Text,
  Image,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
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
  const [fileChanging, setFileChanging] = useState(false);
  const [clickedImage, setClickedImage] = useState<number>(0);
  const [fileName, setFileName] = useState("generated.pdf");
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
    console.log(event.target.files);
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      try {
        setFileChanging(true);

        const convertedFiles = await Promise.all(
          filesArray.map(async (file) => {
            console.log("for file:", file);
            if (file.type === "image/heic") {
              try {
                const convertedBlob = await heic2any({
                  blob: file,
                  toType: "image/jpeg",
                });

                console.log("Converted blob is:", convertedBlob);

                // Ensure the result is a single Blob
                const finalBlob = Array.isArray(convertedBlob)
                  ? convertedBlob[0]
                  : convertedBlob;

                return new File(
                  [finalBlob],
                  file.name.replace(/\.heic$/i, ".jpeg"),
                  { type: "image/jpeg" }
                );
              } catch (error: any) {
                console.log(error.message);
                setSelectedFiles([]);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Error converting .HEIC file",
                });
                return null; // Skip the file if conversion fails
              }
            }
            return file; // Return the file unchanged if not HEIC
          })
        );

        // Filter out any null values from failed conversions
        const validFiles = convertedFiles.filter(
          (file) => file !== null
        ) as File[];

        setSelectedFiles((prev) => [...prev, ...validFiles]);
      } finally {
        setFileChanging(false); // Set this state only once after processing all files
      }
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    const pdfFilenameRegex = /^[a-zA-Z0-9_-]+\.pdf$/;
    if (!pdfFilenameRegex.test(fileName)) {
      return toast({
        variant: "destructive",
        title: "Invalid FileName",
        description: "Please provide valid file name including .pdf at last.",
      });
    }
    setIsGenerating(true);

    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {selectedFiles.map((file, index) => (
            <Image
              key={index}
              src={URL.createObjectURL(file)}
              style={styles.image}
            />
          ))}
        </Page>
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
        description: "Your PDF is ready to download",
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
                accept="image/*, .heic, .avif"
                multiple
                onChange={handleFileChange}
                className="w-full"
              />
              <Input
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                className="w-full"
                placeholder="eg: Database_management.pdf"
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
                      onClick={() => setClickedImage(index + 1)}
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
                  isGenerating || selectedFiles.length === 0 || fileChanging
                }
              >
                {fileChanging
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
