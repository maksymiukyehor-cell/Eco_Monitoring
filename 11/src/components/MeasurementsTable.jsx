import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import apiService from '../services/api';

function MeasurementsTable() { // Компонент таблиці останніх вимірювань
  const [measurements, setMeasurements] = useState([]); // Стан для зберігання вимірювань
  const [loading, setLoading] = useState(true); // Стан для відображення індикатора завантаження
  const [error, setError] = useState(null); // Стан для зберігання помилок
  const [showAll, setShowAll] = useState(false); // Стан для перемикання між останніми та всіма вимірюваннями

  useEffect(() => { // Завантаження даних при зміні стану showAll
    if (showAll) {
      fetchAllMeasurements(); // Якщо showAll true, завантажуємо всі вимірювання
    } else {
      fetchLatestMeasurements(); // Інакше завантажуємо останні вимірювання
    }
  }, [showAll]); //

  const fetchLatestMeasurements = async () => { // Функція для завантаження останніх вимірювань
    try {
      setLoading(true); // Встановлюємо стан завантаження
      const response = await apiService.getLatestMeasurements(); // Виконуємо запит до API
      setMeasurements(response.data || []); // Оновлюємо стан вимірювань
      setError(null); // Очищаємо помилку
    } catch (err) {
      setError('Помилка завантаження останніх вимірювань: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeasurements = async () => { // Функція для завантаження всіх вимірювань
    try {
      setLoading(true); // Встановлюємо стан завантаження
      const response = await apiService.getMeasurements({ limit: 100 }); // Ліміт 100 для прикладу
      setMeasurements(response.data || []); // Оновлюємо стан вимірювань
      setError(null); // Очищаємо помилку
    } catch (err) {
      setError('Помилка завантаження всіх вимірювань: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPollutantBadge = (pollutant, value) => { // Функція для визначення кольору бейджу залежно від рівня забруднення
    // Приклад порогів для різних забруднювачів
    const thresholds = {
      'PM2.5': { warning: 25, danger: 75 },
      'PM10': { warning: 50, danger: 150 },
      'Air Quality Index': { warning: 50, danger: 150 }
    };

    const threshold = thresholds[pollutant]; // Отримуємо пороги для конкретного забруднювача
    if (!threshold) return 'secondary'; // Якщо немає порогів, повертаємо нейтральний колір

    if (value > threshold.danger) return 'danger'; // Якщо перевищує поріг небезпеки
    if (value > threshold.warning) return 'warning'; // Якщо перевищує поріг попередження
    return 'success'; // Якщо все в нормі
  };

  if (loading) { // Відображаємо індикатор завантаження
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>; // Відображаємо повідомлення про помилку
  }

  return (
    <div>
      <div className="mb-3">
        <Button 
          variant={showAll ? "outline-primary" : "primary"}
          onClick={() => setShowAll(!showAll)} // Перемикаємо стан showAll при кліку на кнопку 
          size="sm"
        >
          {showAll ? 'Показати останні' : 'Показати всі'}
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Станція</th>
            <th>Час вимірювання</th>
            <th>Забруднювачі</th>
            <th>Джерело</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement, index) => ( // Використовуємо index як запасний ключ, якщо _id відсутній
            <tr key={`m-${measurement._id || index}`} // унікальний ключ для кожного рядка таблиці
            > 
              <td>
                <code>{measurement.station_id}</code>
              </td>
              <td>
                <small>
                  {new Date(measurement.measurement_time).toLocaleString('uk-UA')}
                </small>
              </td>
              <td>
                <div>
                  {measurement.pollutants?.map((pollutant, idx) => (
                    <Badge 
                      key={`${measurement._id || measurement.station_id}-${pollutant.pollutant}-${idx}`} // ключ складається з унікального ідентифікатора вимірювання, назви забруднювача та індексу
                      bg={getPollutantBadge(pollutant.pollutant, pollutant.value)}
                      className="me-1 mb-1"
                    > 
                      {pollutant.pollutant}: {pollutant.value} {pollutant.unit}
                    </Badge>
                  )) || 'Немає даних'}
                </div> 
              </td>
              <td>
                <small>{measurement.metadata?.source || 'Невідоме'}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {measurements.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            {showAll ? `Показано ${measurements.length} записів` : `Останні вимірювання по станціях: ${measurements.length}`}
          </small>
        </div>
      )}
    </div>
  );
}

export default MeasurementsTable;

// Коментарі до коду:
// Імпортуємо необхідні бібліотеки та компоненти.
// Використовуємо React Bootstrap для стилізації.
// Використовуємо useState для зберігання стану вимірювань, завантаження, помилок та показу всіх/останніх вимірювань.
// Використовуємо useEffect для завантаження даних при зміні стану showAll.
// Функції fetchLatestMeasurements та fetchAllMeasurements виконують запити до API для отримання відповідних даних.
// Функція getPollutantBadge визначає колір бейджу залежно від рівня забруднення.
// Відображаємо таблицю з вимірюваннями або повідомлення про помилку/завантаження.
// Експортуємо компонент MeasurementsTable для використання в інших частинах додатку.