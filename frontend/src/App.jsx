//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import InputForm from './components/InputForm';
import VideoPreview from './components/VideoPreview';
import FinalVideo from './components/FinalVideo'; 
import { Toaster } from "@/components/ui/sonner"; 

import './App.css'

function App() {
  return (
    <>
      {/* 放在最顶层，全局只需要挂一次 */}
      <Toaster richColors position="top-center" />

      <Routes>
        <Route path="/"        element={<InputForm />}   />
        <Route path="/preview" element={<VideoPreview />} />
        <Route path="/final"   element={<FinalVideo />}   />
      </Routes>
    </>
  );
}

export default App
