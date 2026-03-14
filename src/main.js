import "./styles/styles.scss";

document.addEventListener("DOMContentLoaded", () => {
    let links = document.querySelectorAll("nav a");
    for (let i = 0; i < links.length; i++) {
        if (links[i].href === window.location.href) {
            links[i].classList.add("active");
        } else {
            links[i].classList.remove("active");
        }
    }
});

if (document.getElementById("search-input")) {
    const popup = document.getElementById("popupMovie");
    const popupTitle = popup.querySelector(".popup-title");
    const popupPoster = popup.querySelector(".popup-poster");
    const popupOverview = popup.querySelector(".popup-overview");
    const popupClose = popup.querySelector(".popup-close");
    const popupYear = popup.querySelector(".popup-year");
    const popupRating = popup.querySelector(".popup-rating");
    const popupVotes = popup.querySelector(".popup-votes");
    const popupLanguage = popup.querySelector(".popup-language");

    document.querySelector(".container").addEventListener("click", e => {
        const card = e.target.closest(".movie-card");
        if (!card) return;
        popupTitle.textContent = card.dataset.title;
        popupPoster.src = card.dataset.poster;
        popupPoster.alt = card.dataset.title;
        popupOverview.textContent = card.dataset.overview;
        popupYear.textContent = "📅 " + card.dataset.year;
        popupRating.textContent = "⭐ " + card.dataset.rating;
        popupVotes.textContent = "🗳️ " + card.dataset.voteCount + " votes";
        popupLanguage.textContent = "🌐 " + card.dataset.language;
        popup.style.display = "flex";
    });

    popupClose.addEventListener("click", () => (popup.style.display = "none"));
    popup.addEventListener("click", e => {
        if (e.target === popup) popup.style.display = "none";
    });

    document.querySelector(".btn").addEventListener("click", () => {
        const query = document.getElementById("search-input").value.trim();
        if (!query) return;
        document.querySelector(".container").innerHTML = "";
        getData(query);
    });

    document.getElementById("search-input").addEventListener("keydown", e => {
        if (e.key === "Enter") document.querySelector(".btn").click();
    });

    getData();
}

if (document.querySelector(".container") && !document.getElementById("search-input")) {
    const container = document.querySelector(".container");
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favs.length === 0) {
        container.innerHTML = "<p>Du har inga favoriter än.</p>";
    } else {
        favs.forEach(movie => {
            const card = document.createElement("div");
            card.classList.add("movie-card");
            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>${movie.year}</p>
                <button class="fav-btn">★</button>
            `;

            card.querySelector(".fav-btn").addEventListener("click", () => {
                 let favs = JSON.parse(localStorage.getItem("favorites")) || [];
                 favs = favs.filter(f => f.title !== movie.title);
                 localStorage.setItem("favorites", JSON.stringify(favs));
                 card.remove();
                 if (container.querySelectorAll(".movie-card").length === 0) {
                    container.innerHTML = "<p>Du har inga favoriter än.</p>";
                 }
            });




            container.appendChild(card);
        });
    }
}

async function getData(query = "Harry Potter") {
    try {
        const container = document.querySelector(".container");
        let res1 = await fetch(`https://www.omdbapi.com/?apikey=cc03f3bb&s=${encodeURIComponent(query)}`);
        if (!res1.ok) throw new Error("OMDb request failed");
        let data1 = await res1.json();

        let res2 = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=d9b57627d30bdf21b3711be3077d8041&query=${encodeURIComponent(query)}`);
        if (!res2.ok) throw new Error("TMDB request failed");
        let data2 = await res2.json();

        function createCard(title, poster, overview, year, rating, voteCount, language) {
            const card = document.createElement("div");
            card.classList.add("movie-card");
            card.dataset.title = title;
            card.dataset.poster = poster;
            card.dataset.overview = overview || "No overview available";
            card.dataset.year = year;
            card.dataset.rating = rating;
            card.dataset.voteCount = voteCount;
            card.dataset.language = language;

            const img = document.createElement("img");
            img.src = poster;
            img.alt = title;
            card.appendChild(img);

            const h3 = document.createElement("h3");
            h3.textContent = title;
            card.appendChild(h3);

            const p = document.createElement("p");
            p.textContent = year || "N/A";
            card.appendChild(p);

            const favBtn = document.createElement("button");
            favBtn.textContent = "☆";
            favBtn.classList.add("fav-btn");

            const favs = JSON.parse(localStorage.getItem("favorites")) || [];
            if (favs.find(f => f.title === title)) favBtn.textContent = "★";

            favBtn.addEventListener("click", e => {
                e.stopPropagation();
                let favs = JSON.parse(localStorage.getItem("favorites")) || [];
                const movie = { title, poster, overview, year, rating, voteCount, language };
                const index = favs.findIndex(f => f.title === title);
                if (index === -1) {
                    favs.push(movie);
                    favBtn.textContent = "★";
                    showToast("Tillagd i favoriter! ★");
                } else {
                    favs.splice(index, 1);
                    favBtn.textContent = "☆";
                    showToast("Borttagen från favoriter");
                }
                localStorage.setItem("favorites", JSON.stringify(favs));
            });

            card.appendChild(favBtn);
            container.appendChild(card);
        }

        for (let i = 0; i < data1.Search.length; i++) {
            let movie = data1.Search[i];
            let poster = movie.Poster;
            if (poster === "N/A") poster = "/placeholder.jpg";
            let detailRes = await fetch(`https://www.omdbapi.com/?apikey=cc03f3bb&i=${movie.imdbID}`);
            let detail = await detailRes.json();
            let overview = detail.Plot && detail.Plot !== "N/A" ? detail.Plot : "No overview available";
            createCard(movie.Title, poster, overview, movie.Year, detail.imdbRating, detail.imdbVotes, detail.Language);
        }

        for (let i = 0; i < data2.results.length; i++) {
            let movie = data2.results[i];
            let poster = movie.poster_path
                ? "https://image.tmdb.org/t/p/w500/" + movie.poster_path
                : "/placeholder.jpg";
            let overview = movie.overview || "No overview available";
            let year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
            createCard(movie.title, poster, overview, year, movie.vote_average.toFixed(1), movie.vote_count, movie.original_language.toUpperCase());
        }

        function showToast(message) {
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
}

    } catch (error) {
        console.log("Något gick fel " + error);
    }
}