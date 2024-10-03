const apiKey = 'b6e545bed8a9efe48ab8b2fc2b323915'; // Reemplaza con tu clave API
const apiUrl = 'https://api.themoviedb.org/3';
const movieList = document.getElementById('movies');
const movieDetails = document.getElementById('movie-details');
const detailsContainer = document.getElementById('details');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const favoritesList = document.getElementById('favorites-list');
const addToFavoritesButton = document.getElementById('add-to-favorites');
const removeFromFavoritesButton = document.getElementById('remove-from-favorites'); // Nuevo botón
let selectedMovieId = null;
let favoriteMovies = JSON.parse(localStorage.getItem('favorites')) || [];

// Fetch and display popular movies
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${apiUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        if (!response.ok) throw new Error('Failed to fetch popular movies');

        const data = await response.json();
        displayMovies(data.results); // Llama a displayMovies con los resultados
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        movieList.innerHTML = `<p>Unable to load popular movies. Please try again later.</p>`;
    }
}

// Display movies
function displayMovies(movies) {
    movieList.innerHTML = ''; // Limpia la lista de películas
    movies.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <span>${movie.title}</span>
        `;
        li.onclick = () => showMovieDetails(movie.id); // Muestra detalles al hacer clic en la película
        movieList.appendChild(li);
    });
}

// Show movie details
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}&language=en-US`);
        if (!response.ok) throw new Error('Failed to fetch movie details');

        const movie = await response.json();
        detailsContainer.innerHTML = `
            <h3>${movie.title}</h3>
            <p>${movie.overview}</p>
            <p><strong>Fecha de lanzamiento:</strong> ${movie.release_date}</p>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        `;
        selectedMovieId = movieId; // Establece la película seleccionada
        movieDetails.classList.remove('hidden'); // Asegúrate de mostrar el contenedor de detalles

        // Verificar si la película ya está en favoritos
        if (favoriteMovies.some(movie => movie.id === movieId)) {
            addToFavoritesButton.classList.add('hidden');
            removeFromFavoritesButton.classList.remove('hidden');
        } else {
            addToFavoritesButton.classList.remove('hidden');
            removeFromFavoritesButton.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails.innerHTML = `<p>Unable to load movie details. Please try again later.</p>`;
    }
}

// Add movie to favorites or remove movie from favorites
addToFavoritesButton.addEventListener('click', () => {
    if (selectedMovieId) {
        const favoriteMovie = {
            id: selectedMovieId,
            title: document.querySelector('#details h3').textContent
        };
        if (!favoriteMovies.some(movie => movie.id === selectedMovieId)) {
            favoriteMovies.push(favoriteMovie);
            localStorage.setItem('favorites', JSON.stringify(favoriteMovies)); // Guarda en localStorage
            displayFavorites(); // Muestra la lista actualizada de favoritos
            addToFavoritesButton.classList.add('hidden'); // Oculta el botón de añadir
            removeFromFavoritesButton.classList.remove('hidden'); // Muestra el botón de eliminar
        }
    }
});

// Remove movie from favorites
removeFromFavoritesButton.addEventListener('click', () => {
    if (selectedMovieId) {
        favoriteMovies = favoriteMovies.filter(movie => movie.id !== selectedMovieId); // Filtra la película seleccionada
        localStorage.setItem('favorites', JSON.stringify(favoriteMovies)); // Actualiza el localStorage
        displayFavorites(); // Muestra la lista actualizada de favoritos
        removeFromFavoritesButton.classList.add('hidden'); // Oculta el botón de eliminar
        addToFavoritesButton.classList.remove('hidden'); // Muestra el botón de añadir
    }
});

// Search movies
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim(); // Obtener el valor del input
    if (query) {
        try {
            const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
            if (!response.ok) throw new Error('Error fetching search results');

            const data = await response.json();
            if (data.results.length > 0) {
                displayMovies(data.results); // Muestra los resultados de la búsqueda
            } else {
                movieList.innerHTML = `<p>No se encontraron películas para "${query}".</p>`;
            }
        } catch (error) {
            console.error('Error searching movies:', error);
            movieList.innerHTML = `<p>Hubo un error al buscar películas. Inténtalo de nuevo.</p>`;
        }
    }
});

// Display favorite movies
function displayFavorites() {
    favoritesList.innerHTML = ''; // Limpia la lista de favoritos
    favoriteMovies.forEach(movie => {
        const li = document.createElement('li');
        li.textContent = movie.title;
        favoritesList.appendChild(li);
    });
}

// Initial fetch of popular movies and display favorites
fetchPopularMovies(); // Obtiene y muestra las películas populares
displayFavorites(); // Muestra las películas favoritas guardadas
