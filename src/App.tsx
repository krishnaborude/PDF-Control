import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SimpleMerger from './components/SimpleMerger';
import TargetMerger from './components/TargetMerger';
import PNGToPDFConverter from './components/PNGToPDFConverter';
import JPGToPDFConverter from './components/JPGToPDFConverter';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <div className="mt-[72px]"> {/* Add padding for fixed header */}
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/simple-merge" element={<SimpleMerger />} />
          <Route path="/target-merge" element={<TargetMerger />} />
          <Route path="/png-to-pdf" element={<PNGToPDFConverter />} />
          <Route path="/jpg-to-pdf" element={<JPGToPDFConverter />} />
          </Routes>
        </div>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App
