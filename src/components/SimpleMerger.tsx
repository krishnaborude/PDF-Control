import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';
import { DocumentIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PDFFile {
  file: File;
  name: string;
  pageCount: number;
  id: string;
}

export default function SimpleMerger() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      const newPdfs: PDFFile[] = [];

      for (const file of acceptedFiles) {
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} is not a PDF file`);
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        newPdfs.push({
          file,
          name: file.name,
          pageCount,
          id: crypto.randomUUID()
        });
      }

      setPdfs(prev => [...prev, ...newPdfs]);
      toast.success('PDFs added successfully');
    } catch (error) {
      console.error('Error loading PDFs:', error);
      toast.error('Error loading PDF files');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removePdf = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const mergePDFs = async () => {
    if (pdfs.length === 0) {
      toast.error('Please add at least one PDF');
      return;
    }

    setIsLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdf of pdfs) {
        const pdfDoc = await PDFDocument.load(await pdf.file.arrayBuffer());
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Error merging PDFs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-100">Simple PDF Merger</h2>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-500 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">
                Drop PDFs here or click to select
              </p>
            </div>
          </div>

          {pdfs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Selected PDFs</h3>
              <div className="space-y-2">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-6 w-6 text-blue-400" />
                      <div>
                        <p className="text-gray-300">{pdf.name}</p>
                        <p className="text-sm text-gray-400">Pages: {pdf.pageCount}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePdf(pdf.id)}
                      className="text-gray-500 hover:text-gray-400"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={mergePDFs}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-md text-white flex items-center justify-center ${
                  isLoading
                    ? 'bg-blue-500/50 cursor-not-allowed'
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Merging PDFs...</span>
                  </>
                ) : (
                  'Merge PDFs'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
