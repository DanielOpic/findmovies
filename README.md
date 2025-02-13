🎬 FindMovies to aplikacja do wyszukiwania i rekomendacji filmów na podstawie podobieństwa fabularnego.

🛠️ Technologie
Frontend: React, Tailwind CSS
Backend: Node.js, Express.js, MongoDB (Atlas) - Wyszukiwanie wektorowe

🚀 Instalacja
I. Ogarnij Mongo DB
1. Założ konta w MongoDB: https://www.mongodb.com/
2. Utwórz i wypełnij kolekcję przykładowymi danymi - korzystając z funkcji Load Sample Dataset
3. Wśród wypełnionych danych będzie kolekcja sample_mflix.embedded_movies
4. Przejdż do Services -> Atlas Search -> Create Search Index
4. Stwórz "Vector Search Index" w kolekcji sample_mflix.embedded_movies - na plot_embedding, funkcja porównująca to "cosine" (rozmiar 1536).
   Można dla ułatwienia użyć konfiguracji JSON:
    {
        "fields": [
            {
            "numDimensions": 1536,
            "path": "plot_embedding",
            "similarity": "cosine",
            "type": "vector"
            }
        ]
    }



II. Sklonuj repozytorium:
1. cd 80findmovies
2. Zmień plik /backend/.env.example na /backend/.env
3. Wypełnij go swoimi danymi 

MONGO_USER=your_mongo_user 
MONGO_PASSWORD=your_mongo_password 
MONGO_CLUSTER=your_mongo_cluster 
MONGO_DB=sample_mflix # Twoja baza - tu zostaw sample_mflix 
MONGO_APP_NAME=your_app_name 

III. Zainstaluj zależności backend i frontend
cd backend
npm install
cd ../frontend
npm install

IV. Otwórz 2 terminale i z głównego katalogu:
1. Uruchom backend:
    cd backend
    npm start

2. Uruchom frontend:
    cd frontend
    npm run dev

V. Otwórz aplikację:

Frontend będzie dostępny pod: http://localhost:3000
Backend działa na http://localhost:5000

📄 Licencja
MIT License