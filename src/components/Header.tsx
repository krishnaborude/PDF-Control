import { DocumentIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold">PDF Merger</h1>
          </div>
          <div>
            <nav className="flex items-center space-x-6">
              <a 
                href="https://github.com/krishnaborude/PDF-Merger"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
