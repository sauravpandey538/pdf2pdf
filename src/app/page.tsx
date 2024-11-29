"use client";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
const tools = [
  // {
  //   name: "PDF to Word",
  //   description: "Convert PDF documents into plain text.",
  //   buttonText: "Try Now",
  //   bgColor: "bg-blue-600",
  //   hoverColor: "hover:bg-blue-700",
  //   to: "/pdf-to-word",
  // },
  {
    name: "Image to  Pdf",
    description: "Merge multiple PDFs into a single document.",
    buttonText: "Try Now",
    bgColor: "bg-purple-600",
    hoverColor: "hover:bg-purple-700",
    to: "image-to-pdf",
  },
  {
    name: "Text to PDF",
    description: "Convert your text into a professional PDF.",
    buttonText: "Try Now",
    bgColor: "bg-green-600",
    hoverColor: "hover:bg-green-700",
    to: "/text-to-pdf",
  },
  // {
  //   name: "PDF Editor",
  //   description: "Edit your PDFs with ease, add or remove content.",
  //   buttonText: "Try Now",
  //   bgColor: "bg-yellow-600",
  //   hoverColor: "hover:bg-yellow-700",
  //   to: "",
  // },
  // {
  //   name: "PDF Splitter",
  //   description: "Split a large PDF into smaller parts.",
  //   buttonText: "Try Now",
  //   bgColor: "bg-red-600",
  //   hoverColor: "hover:bg-red-700",
  //   to: "",
  // },
  // {
  //   name: "PDF Merger",
  //   description: "Merge multiple PDFs into a single document.",
  //   buttonText: "Try Now",
  //   bgColor: "bg-purple-600",
  //   hoverColor: "hover:bg-purple-700",
  //   to: "",
  // },
];
const HomePage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-16">
      <h1 className="text-4xl font-semibold mb-8">Welcome to PDF Tools</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
        {tools.map((tool, index) => (
          <Card
            key={index}
            className="bg-white p-6 shadow-md rounded-lg text-center hover:transition duration-300"
          >
            <h2 className="text-xl font-semibold mb-4">{tool.name}</h2>
            <p className="text-gray-600 mb-4">{tool.description}</p>
            <button
              className={`${tool.bgColor} text-white px-4 py-2 rounded-md ${tool.hoverColor} transition`}
              onClick={() => router.push(`${tool.to}`)}
            >
              {tool.buttonText}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
