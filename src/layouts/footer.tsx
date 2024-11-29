import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa"; // For LinkedIn, GitHub, and Email icons

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6  ">
      <div className="max-w-screen-lg mx-auto flex justify-between items-center px-4 flex-wrap gap-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Saurav Pandey. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-6">
          <a
            href="https://www.linkedin.com/in/saurav-pandey-b3648530a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href="https://github.com/sauravpandey538"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://saurav0325.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">Portfolio</span>
          </a>
          <a
            href="mailto:sauravpandey0325@gmail.com"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaEnvelope size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
