//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import InputForm from './components/InputForm';
import VideoPreview from './components/VideoPreview';
import FinalVideo from './components/FinalVideo'; 

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputForm />} />
      <Route path="/preview" element={<VideoPreview />} />
      <Route path="/final" element={<FinalVideo />} /> {/* ← 新增 */}
    </Routes>
  )
}

export default App
