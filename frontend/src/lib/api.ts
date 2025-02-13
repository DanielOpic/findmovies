import axiosInstance from './axiosConfig';

// Wysyłam zapytanie do API na podany endpoint z opcjonalnymi parametrami
export const searchApi = async (endpoint: string, params?: { [key: string]: any }) => {
  try {
    if (!endpoint) {
      console.error("Endpoint jest wymagany!");
      return null;
    }

    const response = await axiosInstance.post(
      endpoint,
      params || {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Błąd przy wysyłaniu zapytania:", error);
    return null;
  }
};
