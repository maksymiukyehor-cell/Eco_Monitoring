import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import StationsTable from './components/StationsTable';
import MeasurementsTable from './components/MeasurementsTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h2>Станції моніторингу</h2>
            <StationsTable />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12">
            <h2>Останні вимірювання</h2>
            <MeasurementsTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
// Коментарі до коду:
// Імпортуємо React та необхідні компоненти і стилі.
// Функціональний компонент App є головним компонентом додатку.
// Використовуємо Bootstrap для стилізації.
// Включаємо компоненти Header, StationsTable та MeasurementsTable для відображення відповідних секцій.
// Експортуємо компонент App для використання в інших частинах додатку.