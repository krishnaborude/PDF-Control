import { useNavigate } from 'react-router-dom';
import { DocumentDuplicateIcon, DocumentArrowDownIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex-1 bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-100 mb-12">
                    PDF Merger
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {/* Simple Merge Container */}
                    <div
                        onClick={() => navigate('/simple-merge')}
                        className="bg-gray-800 rounded-xl p-8 cursor-pointer hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <DocumentDuplicateIcon className="h-16 w-16 text-blue-400 group-hover:text-blue-300" />
                            <h2 className="text-2xl font-semibold text-gray-100">Simple Merge</h2>
                            <p className="text-gray-400 text-center">
                                Combine multiple PDFs into a single document in sequential order
                            </p>
                        </div>
                    </div>

                    {/* Target Merge Container */}
                    <div
                        onClick={() => navigate('/target-merge')}
                        className="bg-gray-800 rounded-xl p-8 cursor-pointer hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <DocumentArrowDownIcon className="h-16 w-16 text-blue-400 group-hover:text-blue-300" />
                            <h2 className="text-2xl font-semibold text-gray-100">Target Merge</h2>
                            <p className="text-gray-400 text-center">
                                Insert PDF pages at specific positions in another PDF document
                            </p>
                        </div>
                    </div>

                    {/* PNG to PDF Converter */}
                    <div
                        onClick={() => navigate('/png-to-pdf')}
                        className="bg-gray-800 rounded-xl p-8 cursor-pointer hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <PhotoIcon className="h-16 w-16 text-blue-400 group-hover:text-blue-300" />
                            <h2 className="text-2xl font-semibold text-gray-100">PNG to PDF</h2>
                            <p className="text-gray-400 text-center">
                                Convert PNG images into a PDF document with customizable order
                            </p>
                        </div>
                    </div>

                    {/* JPG to PDF Converter */}
                    <div
                        onClick={() => navigate('/jpg-to-pdf')}
                        className="bg-gray-800 rounded-xl p-8 cursor-pointer hover:bg-gray-700 transition-colors group"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <CameraIcon className="h-16 w-16 text-blue-400 group-hover:text-blue-300" />
                            <h2 className="text-2xl font-semibold text-gray-100">JPG to PDF</h2>
                            <p className="text-gray-400 text-center">
                                Convert JPG/JPEG images into a PDF document with custom ordering
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
