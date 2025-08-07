import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { DocumentIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PDFFile {
  file: File;
  name: string;
  pageCount: number;
  id: string;
}

interface PageRange {
  start: number;
  end: number;
}

interface SourcePDFSectionProps {
  sourcePDF: PDFFile | null;
  setSourcePDF: (pdf: PDFFile | null) => void;
  selectedPages: PageRange;
  setSelectedPages: (range: PageRange) => void;
}

export default function SourcePDFSection({
  sourcePDF,
  setSourcePDF,
  selectedPages,
  setSelectedPages,
}: SourcePDFSectionProps) {
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      setSourcePDF({
        file,
        name: file.name,
        pageCount,
        id: crypto.randomUUID()
      });

      setSelectedPages({ start: 1, end: Math.min(5, pageCount) });
      toast.success('Source PDF loaded successfully');
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Error loading PDF file');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handlePageRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numValue = parseInt(value) || 1;
    
    if (sourcePDF) {
      setSelectedPages({
        ...selectedPages,
        [name]: Math.max(1, Math.min(numValue, sourcePDF.pageCount))
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-100">Source PDF (A)</h2>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-500 transition-colors"
      >
        <input {...getInputProps()} />
        {sourcePDF ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentIcon className="h-6 w-6 text-blue-400" />
                <span className="text-gray-300">{sourcePDF.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSourcePDF(null);
                }}
                className="text-gray-500 hover:text-gray-400"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Pages: {sourcePDF.pageCount}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400">Start Page</label>
                <input
                  type="number"
                  name="start"
                  min={1}
                  max={sourcePDF.pageCount}
                  value={selectedPages.start}
                  onChange={handlePageRangeChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">End Page</label>
                <input
                  type="number"
                  name="end"
                  min={1}
                  max={sourcePDF.pageCount}
                  value={selectedPages.end}
                  onChange={handlePageRangeChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              Drop source PDF here or click to select
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
