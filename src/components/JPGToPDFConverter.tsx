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

export default function JPGToPDFConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const newImages = await Promise.all(
        acceptedFiles
          .filter(file => file.type === 'image/jpeg' || file.type === 'image/jpg')
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
        toast.error('Some files were skipped. Only JPG/JPEG files are supported.');
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
    accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const image of images) {
        const imageBytes = await image.file.arrayBuffer();
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Calculate dimensions to fit image within page while maintaining aspect ratio
        const imgWidth = jpgImage.width;
        const imgHeight = jpgImage.height;
        const ratio = Math.min(width / imgWidth, height / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Center the image on the page
        const x = (width - finalWidth) / 2;
        const y = (height - finalHeight) / 2;
        
        page.drawImage(jpgImage, {
          x,
          y,
          width: finalWidth,
          height: finalHeight,
        });
      }

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
      
      toast.success('PDF created successfully!');
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('Error creating PDF');
    }
  };

  // Cleanup previews when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  return (
    <div className="flex-1 bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">JPG to PDF Converter</h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50/5' : 'border-gray-600 hover:border-gray-500'}`}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-300 mb-2">Drag and drop JPG/JPEG files here, or click to select files</p>
          <p className="text-gray-500 text-sm">Only JPG/JPEG files are supported</p>
        </div>

        {images.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Images ({images.length})</h2>
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Convert to PDF
              </button>
            </div>
            
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={image.id} className="flex items-center bg-gray-800 p-4 rounded-lg">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <p className="text-gray-200 font-medium">{image.name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => index > 0 && moveImage(index, index - 1)}
                        disabled={index === 0}
                        className={`p-2 rounded ${
                          index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <ArrowsUpDownIcon className="h-5 w-5 rotate-180" />
                      </button>
                      <button
                        onClick={() => index < images.length - 1 && moveImage(index, index + 1)}
                        disabled={index === images.length - 1}
                        className={`p-2 rounded ${
                          index === images.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <ArrowsUpDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-2 text-gray-400 hover:text-gray-200 rounded"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
