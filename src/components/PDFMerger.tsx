import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PDFFile {
  file: File;
  name: string;
  id: string;
}

export default function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPdfFiles = acceptedFiles
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        file,
        name: file.name,
        id: crypto.randomUUID()
      }));

    if (newPdfFiles.length !== acceptedFiles.length) {
      toast.error('Some files were not PDFs and were ignored');
    }

    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (id: string) => {
    setPdfFiles(files => files.filter(file => file.id !== id));
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    setIsLoading(true);
    const mergedPdf = await PDFDocument.create();

    try {
      for (const pdfFile of pdfFiles) {
        const fileBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDFs merged successfully!');
    } catch (error) {
      toast.error('Error merging PDFs. Please try again.');
      console.error('Error merging PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-100">Merge Your PDFs</h2>
          <p className="mt-2 text-sm text-gray-400">
            Drag and drop your PDF files or click to select them
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`mt-8 p-8 border-2 border-dashed rounded-lg text-center ${
            isDragActive ? 'border-blue-400 bg-gray-800' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2 text-sm text-gray-400">
            {isDragActive
              ? 'Drop the PDF files here...'
              : 'Drag and drop PDF files here, or click to select files'}
          </p>
        </div>

        {pdfFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-100">Selected Files</h2>
            <ul className="mt-4 space-y-2">
              {pdfFiles.map(file => (
                <li
                  key={file.id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg shadow-sm"
                >
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-300">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={mergePDFs}
              disabled={isLoading}
              className={`mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-blue-500 opacity-75 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 transition-colors'
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Merging PDFs...
                </>
              ) : (
                'Merge PDFs'
              )}
            </button>
          </div>
        )}
        <Toaster position="bottom-center" />
      </div>
    </div>
  );
}
