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

interface TargetPDFSectionProps {
  targetPDF: PDFFile | null;
  setTargetPDF: (pdf: PDFFile | null) => void;
  insertPosition: number;
  setInsertPosition: (position: number) => void;
}

export default function TargetPDFSection({
  targetPDF,
  setTargetPDF,
  insertPosition,
  setInsertPosition,
}: TargetPDFSectionProps) {
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

      setTargetPDF({
        file,
        name: file.name,
        pageCount,
        id: crypto.randomUUID()
      });

      setInsertPosition(1);
      toast.success('Target PDF loaded successfully');
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

  const handleInsertPositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 1;
    if (targetPDF) {
      setInsertPosition(Math.max(1, Math.min(value, targetPDF.pageCount)));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-100">Target PDF (B)</h2>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-500 transition-colors"
      >
        <input {...getInputProps()} />
        {targetPDF ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentIcon className="h-6 w-6 text-blue-400" />
                <span className="text-gray-300">{targetPDF.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetPDF(null);
                }}
                className="text-gray-500 hover:text-gray-400"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Pages: {targetPDF.pageCount}</p>
            <div>
              <label className="block text-sm text-gray-400">Insert After Page</label>
              <input
                type="number"
                min={1}
                max={targetPDF.pageCount}
                value={insertPosition}
                onChange={handleInsertPositionChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-300"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              Drop target PDF here or click to select
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
