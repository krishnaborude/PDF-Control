import PDFMerger from './components/PDFMerger'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <PDFMerger />
      <Footer />
    </div>
  )
}

export default App
