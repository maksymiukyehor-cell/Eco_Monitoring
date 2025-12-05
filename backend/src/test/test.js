import request from "supertest";
import app from "../app.js";

describe('Measurements API', () => {
    test('Має створити нове вимірювання', async () => {
        const response = await request(app)
        .post('/api/measurements')
        .send({
            station_id: "TEST_STATION_002",
            measurement_time: "2025-10-16T00:00:00.000Z",
            pollutants: [
            {
                pollutant: "Temperature",
                value: 55,
                unit: "Celcius",
                averaging_period: "5 minutes",
                quality_flag: "valid"
            },
            {
                pollutant: "PM2.5",
                value: 15.2,
                unit: "ug/m3",
                averaging_period: "2 minutes",
                quality_flag: "valid"
            }
            ]
        })
        .expect(201);
        expect(response.body.success).toBe(true);
    });

    test('Має повернути помилку при створюванні нового вимірювання', async () => {
        const response = await request(app)
        .post('/api/measurements')
        .send({
            station_id: "SAVEDNIPRO_20081",
        })
        .expect(400);
        expect(response.body.success).toBe(false);
    });


    test('Має отримати всі вимірювання', async () => {
        const response = await request(app)
        .get('/api/measurements')
        .expect(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Має отримати вимірювання окремого забрудювача окремої станції', async () => {
    const response = await request(app)
      .get(`/api/measurements/read/SAVEDNIPRO_20081?pollutant=Temperature`)
      .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toBeNull();
    });

    test('Має оновити теспературу окремого вимірювання за датою', async () => {
    const response = await request(app)
      .put(`/api/measurements/SAVEDNIPRO_20081`)
      .send({
        measurement_time: "2025-10-16T23:45:42Z",
        pollutants: [
            {
                pollutant: "Temperature",
                value: 88,
                unit: "Celcius",
                averaging_period: "5 minutes",
                quality_flag: "valid"
            }
            ] 
        })
      .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pollutants[0].value).toBe(88);
    });

    test('Має видалити вимірювання', async () => {
    const response = await request(app)
      .delete(`/api/measurements/TEST_STATION_002`)
      .send({ measurement_time: "2025-10-16T00:00:00.000Z" })
      .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Має показати помилку оновлення вимірювання через неправильну станцію', async () => {
    const response = await request(app)
      .put('/api/measurements/WRONG_DATA')
      .send({ 
        measurement_time: new Date(), 
        pollutants: [
            { 
                pollutant: 'Temperature', value: 20 
            }] 
        })
      .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('Маж показати помилку про некорректні дані', async () => {
    const response = await request(app)
      .post('/api/measurements')
      .send({ station_id: "WRONG" })
      .expect(400);

      expect(response.body.success).toBe(false);
    });
});

describe('Stations API', () => {
    test('Має створити нову станцію', async () => {
        const response = await request(app)
        .post('/api/stations')
        .send({
            station_id: "TEST_STATION_001",
            city_name: "Kyiv",
            station_name: "Test Station",
            local_name: "Локальна тестова станція",
            timezone: "Europe/Kyiv",
            location: {
                type: "Point",
                coordinates: [30.5234, 50.4501]
            },
            platform_name: "Test Platform",
            measured_parameters: ["Temperature", "Humidity"]
        })
        .expect(201);
        expect(response.body.success).toBe(true);
    });

    test('Має повернути помилку при створенні станції з відсутніми даними', async () => {
        const response = await request(app)
        .post('/api/stations')
        .send({
            city_name: "Kyiv"
        })
        .expect(400);
        expect(response.body.success).toBe(false);
    });

    test('Має отримати інформацію про станцію', async () => {
        const response = await request(app)
        .get('/api/stations/TEST_STATION_001')
        .expect(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.station_id).toBe("TEST_STATION_001");
    });

    test('Має повернути помилку при отриманні неіснуючої станції', async () => {
        const response = await request(app)
        .get('/api/stations/NON_EXISTENT_STATION')
        .expect(404);
        expect(response.body.success).toBe(false);
    });

    test('Має оновити інформацію про станцію', async () => {
        const response = await request(app)
        .put('/api/stations/TEST_STATION_001')
        .send({
            city_name: "Kyiv",
            station_id: "TEST_STATION_001",
            station_name: "Updated Test Station",
            local_name: "Оновлена локальна назва",
            timezone: "Europe/Kyiv",
            location: {
                type: "Point",
                coordinates: [30.5234, 50.4501]
            },
            platform_name: "Updated Test Platform",
            measured_parameters: ["Temperature", "Humidity"]
        })
        .expect(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.station_name).toBe("Updated Test Station");
    });

    test('Має повернути помилку при оновленні неіснуючої станції', async () => {
        const response = await request(app)
        .put('/api/stations/NON_EXISTENT_STATION')
        .send({
            station_id: "NON_EXISTENT_STATION",
            station_name: "Updated Test Station",
            location: {
                type: "Point",
                coordinates: [30.5234, 50.4501]
            },
            platform_name: "Updated Test Platform",
            measured_parameters: ["Temperature", "Humidity"]
        })
        .expect(404);
        expect(response.body.success).toBe(false);
    });

    test('Має видалити станцію', async () => {
        const response = await request(app)
        .delete('/api/stations/TEST_STATION_001')
        .expect(200);
        expect(response.body.success).toBe(true);
    });

    test('Має повернути помилку при видаленні неіснуючої станції', async () => {
        const response = await request(app)
        .delete('/api/stations/NON_EXISTENT_STATION')
        .expect(404);
        expect(response.body.success).toBe(false);
    });
});