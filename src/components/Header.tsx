import { DocumentIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold">PDF Merger</h1>
          </div>
          <div>
            <a 
              href="https://github.com/yourusername/pdf-merger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
