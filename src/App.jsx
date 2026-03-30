import React from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Pricings from './pages/Pricings';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { useSelector } from 'react-redux';
import useGetCurrent from './hooks/useGetCurrent';
import WebsiteEditor from './pages/Editor';
import Auth from './pages/Auth';

export const serverUrl = "https://cromp-ai-backend.onrender.com"

function App() {
  const { userData } = useSelector((state) => state.user)

  useGetCurrent()

  return (
   <BrowserRouter>
   <Routes>
   <Route path='/' element={<Home/>} />
   <Route path='/auth' element={<Auth/>} />
    <Route path='/pricing' element={<Pricings/>} />
    <Route path='/dashboard' element={userData ? <Dashboard/> : <Home/>} />
    <Route path='/generate' element={userData ? <Generate/> : <Home/>} />
    <Route path='/editor/:id' element={userData ? <WebsiteEditor/> : <Home/>} />
   </Routes>
   </BrowserRouter>
  );
}

export default App;
