export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} PDF Merger. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="/privacy"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="mailto:contact@pdfmerger.com"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
