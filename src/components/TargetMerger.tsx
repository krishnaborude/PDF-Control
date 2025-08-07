import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import toast from 'react-hot-toast';
import SourcePDFSection from './SourcePDFSection';
import TargetPDFSection from './TargetPDFSection';

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

export default function TargetMerger() {
  const [sourcePDF, setSourcePDF] = useState<PDFFile | null>(null);
  const [targetPDF, setTargetPDF] = useState<PDFFile | null>(null);
  const [selectedPages, setSelectedPages] = useState<PageRange>({ start: 1, end: 1 });
  const [insertPosition, setInsertPosition] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setSourcePDF(null);
    setTargetPDF(null);
    setSelectedPages({ start: 1, end: 1 });
    setInsertPosition(1);
  };

  const mergePDFs = async () => {
    if (!sourcePDF || !targetPDF) {
      toast.error('Please upload both PDFs');
      return;
    }

    if (selectedPages.start > selectedPages.end) {
      toast.error('Invalid page range');
      return;
    }

    setIsLoading(true);

    try {
      // Load both PDFs
      const sourceArrayBuffer = await sourcePDF.file.arrayBuffer();
      const targetArrayBuffer = await targetPDF.file.arrayBuffer();
      
      const sourcePdfDoc = await PDFDocument.load(sourceArrayBuffer);
      const targetPdfDoc = await PDFDocument.load(targetArrayBuffer);
      
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Copy pages from target PDF up to insert position
      const targetPages = await mergedPdf.copyPages(targetPdfDoc, Array.from(
        { length: insertPosition },
        (_, i) => i
      ));
      targetPages.forEach(page => mergedPdf.addPage(page));

      // Copy selected pages from source PDF
      const sourcePages = await mergedPdf.copyPages(sourcePdfDoc, Array.from(
        { length: selectedPages.end - selectedPages.start + 1 },
        (_, i) => i + selectedPages.start - 1
      ));
      sourcePages.forEach(page => mergedPdf.addPage(page));

      // Copy remaining pages from target PDF
      const remainingTargetPages = await mergedPdf.copyPages(targetPdfDoc, Array.from(
        { length: targetPDF.pageCount - insertPosition },
        (_, i) => i + insertPosition
      ));
      remainingTargetPages.forEach(page => mergedPdf.addPage(page));

      // Save and download the merged PDF
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
          <h2 className="text-2xl font-bold text-gray-100">Target PDF Merger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SourcePDFSection
              sourcePDF={sourcePDF}
              setSourcePDF={setSourcePDF}
              selectedPages={selectedPages}
              setSelectedPages={setSelectedPages}
            />
            <TargetPDFSection
              targetPDF={targetPDF}
              setTargetPDF={setTargetPDF}
              insertPosition={insertPosition}
              setInsertPosition={setInsertPosition}
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={mergePDFs}
              disabled={!sourcePDF || !targetPDF || isLoading}
              className={`px-4 py-2 rounded-md text-white flex items-center space-x-2 ${
                isLoading || !sourcePDF || !targetPDF
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
        </div>
      </div>
    </div>
  );
}
