import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import "./styles/dashboard.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/Dashboard";
import StationsTablePage from "./pages/StationsTablePage";
import MeasurementsTablePage from "./pages/MeasurementsTablePage";
import CrudPage from "./pages/CrudPage";
import AirIndexPage from "./pages/AirIndexPage";

function App() {

  return (
    
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} />
      <Routes>

        {/* Головна сторінка */}
        <Route path="/" element={<Dashboard />} />

        {/* Сторінка таблиці станцій */}
        <Route path="/stations" element={<StationsTablePage />} />

        {/* Сторінка таблиці вимірювань */}
        <Route path="/measurements" element={<MeasurementsTablePage />} />

        {/* Сторінка з крудами */}
        <Route path="/crud" element={<CrudPage />} />

        {/* Сторінка 3 лаби */}
        <Route path="/airindex" element={<AirIndexPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
