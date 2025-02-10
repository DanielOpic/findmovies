import axiosInstance from './axiosConfig';

export const searchApi = async (endpoint: string, params?: { [key: string]: any }) => {
  try {
    if (!endpoint) {
      console.error("Endpoint jest wymagany!");
      return null; // Zwróć null, jeśli brak endpointu
    }

    // Ustawienie nagłówka, aby wysłać dane jako JSON
    const response = await axiosInstance.post(
      endpoint,
      params || {}, // Wysyłamy dane, jeśli są dostępne
      {
        headers: {
          'Content-Type': 'application/json' // Nagłówek dla JSON
        }
      }
    );
    
    return response.data; // Zwróć dane z odpowiedzi
  } catch (error) {
    console.error("Błąd przy wysyłaniu zapytania:", error);
    return null; // Zwróć null w przypadku błędu
  }
};
