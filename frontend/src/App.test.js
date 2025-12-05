import { render, screen, waitFor } from "@testing-library/react"; // Імпортуємо функції для тестування React-компонентів
import "@testing-library/jest-dom"; // Імпортуємо додаткові матчери для jest
import App from "./App"; // Імпортуємо головний компонент додатку

jest.mock("./services/api", () => ({ // Мок сервісу API
  getStations: jest.fn().mockResolvedValue({ data: [{ id: 1, name: "Test Station" }] }), // Мок відповіді для getStations
  getLatestMeasurements: jest.fn().mockResolvedValue({ data: [{ stationId: 1, value: 42 }] }), // Мок відповіді для getLatestMeasurements
  getHealth: jest.fn().mockResolvedValue({ success: true }), // Мок відповіді для getHealth
  syncSaveEcoBot: jest.fn().mockResolvedValue({ results: [] }), // Мок відповіді для syncSaveEcoBot
})); 

test("renders header text", async () => {
  // Рендеримо компонент
  render(<App />);
  // Чекаємо коли з'явиться текст у DOM
  const headerElement = await screen.findByText(/Екологічний моніторинг/i); 

  expect(headerElement).toBeInTheDocument(); // Перевіряємо що елемент є в документі

  // Перевіримо, що підтягнулись станції (з мока)
  await waitFor(() => {
    expect(screen.getByText(/Станції моніторингу/i)).toBeInTheDocument(); // Чекаємо поки з'явиться текст "Станції моніторингу"
  }); 
});

// render() → рендерить React-компонент у віртуальний DOM для тестування.
// screen → об'єкт для пошуку елементів у DOM (getByText, findByText, queryByText тощо).
//   - getBy...() → шукає елемент, кидає помилку якщо не знайдено
//   - findBy...() → асинхронно шукає елемент, повертає проміс
//   - queryBy...() → шукає елемент, повертає null якщо не знайдено
// waitFor(() => { ... }) → чекає доки умова стане правдивою (для асинхронних операцій).
// expect(value).matcher → перевірка (assertion).
//   - toBeInTheDocument() → елемент є в DOM
//   - toHaveTextContent('текст') → елемент містить текст