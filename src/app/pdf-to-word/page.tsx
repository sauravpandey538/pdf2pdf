"use client";
// app/upload/page.tsx
import React, { useState } from "react";

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/read-pdf-for-word", {
        method: "POST",
        body: formData,
      });
      //console.log(response);
      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data: { url: string } = await response.json();
      setDocUrl(data.url);
    } catch (error) {
      //console.error("Error uploading file:", error);
      //   alert("Error uploading file");
    }
  };

  return (
    <div>
      <h1>PDF to DOC Converter</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload and Convert
      </button>
      {docUrl && (
        <div>
          <p>
            Conversion complete!{" "}
            <a href={docUrl} download>
              Download DOC
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
