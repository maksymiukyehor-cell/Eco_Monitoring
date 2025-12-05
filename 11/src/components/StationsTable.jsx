import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Badge } from 'react-bootstrap';
import apiService from '../services/api';

function StationsTable() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStations();
      setStations(response.data || []);
      setError(null);
    } catch (err) {
      setError('Помилка завантаження станцій: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      maintenance: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID станції</th>
            <th>Місто</th>
            <th>Назва станції</th>
            <th>Статус</th>
            <th>Координати</th>
            <th>Параметри</th>
            <th>Останнє вимірювання</th>
          </tr>
        </thead>
        <tbody>
          {stations.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                Станції не знайдені
              </td>
            </tr>
          ) : (
            stations.map((station) => (
              <tr key={`station-${station.station_id}-${station.city_name}`}> {/* унікальний ключ для кожного рядка таблиці */}
                <td>
                  <code>{station.station_id}</code>
                </td>
                <td>{station.city_name}</td>
                <td>{station.station_name}</td>
                <td>{getStatusBadge(station.status)}</td>
                <td>
                  <small>
                    {station.location?.coordinates?.[1]?.toFixed(4)}, 
                    {station.location?.coordinates?.[0]?.toFixed(4)}
                  </small>
                </td>
                <td>
                  <small>
                    {station.measured_parameters?.join(', ') || 'Не вказано'}
                  </small>
                </td>
                <td>
                  <small>
                    {station.metadata?.last_measurement 
                      ? new Date(station.metadata.last_measurement).toLocaleString('uk-UA')
                      : 'Немає даних'
                    }
                  </small>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      
      {stations.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            Всього станцій: {stations.length}
          </small>
        </div>
      )}
    </div>
  );
}

export default StationsTable;
// Коментарі до коду:
// Імпортуємо необхідні бібліотеки та компоненти.
// Функціональний компонент StationsTable відповідає за відображення таблиці станцій.
// Використовуємо хуки useState та useEffect для управління станом та побічними ефектами.
// Функція fetchStations отримує дані про станції з API і оновлює стан компонента.
// Функція getStatusBadge повертає відповідний бейдж для статусу станції.
// Відображаємо індикатор завантаження, повідомлення про помилку або таблицю з даними залежно від стану.
// Експортуємо компонент StationsTable для використання в інших частинах додатку.