import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface ImageFile {
  file: File;
  name: string;
  id: string;
  preview: string;
}

export default function PNGToPDFConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const newImages = await Promise.all(
        acceptedFiles
          .filter(file => file.type === 'image/png')
          .map(async (file) => {
            const preview = URL.createObjectURL(file);
            return {
              file,
              name: file.name,
              id: crypto.randomUUID(),
              preview
            };
          })
      );

      if (newImages.length !== acceptedFiles.length) {
        toast.error('Some files were skipped. Only PNG files are supported.');
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success('Images added successfully');
    } catch (error) {
      console.error('Error adding images:', error);
      toast.error('Error adding images');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'] },
  });

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Cleanup previews for removed images
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return filtered;
    });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }

      const newImages = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const image of images) {
        try {
          // Convert PNG to Uint8Array
          const arrayBuffer = await image.file.arrayBuffer();
          const pngImage = await pdfDoc.embedPng(arrayBuffer);
          
          // Add a new page with the image's dimensions
          const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
          
          // Draw the image on the page
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pngImage.width,
            height: pngImage.height,
          });
        } catch (error) {
          console.error(`Error processing image ${image.name}:`, error);
          toast.error(`Error processing ${image.name}`);
        }
      }

      // Save and download the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted-images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Images converted to PDF successfully!');
    } catch (error) {
      console.error('Error converting to PDF:', error);
      toast.error('Error converting to PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  return (
    <div className="flex-1 bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-100">PNG to PDF Converter</h2>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-gray-500 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">
                Drop PNG images here or click to select
              </p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Selected Images</h3>
              <div className="space-y-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-gray-300">{image.name}</p>
                        <p className="text-sm text-gray-400">Page {index + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-400'
                        }`}
                      >
                        <ArrowsUpDownIcon className="h-5 w-5 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                        className={`p-1 rounded ${
                          index === images.length - 1
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-400'
                        }`}
                      >
                        <ArrowsUpDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="text-gray-500 hover:text-gray-400"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={convertToPDF}
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
                    <span>Converting...</span>
                  </>
                ) : (
                  'Convert to PDF'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
