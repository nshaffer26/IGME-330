import { getAPIAccessHeaders, getSettings } from "./utils.js";

let localStorageKey = "njs7772-p1-settings";

let clear = document.querySelector("#controls-clear");
clear.addEventListener("click", clearFavorites);

showFavorites();

function showFavorites()
{
    results.innerHTML = "";
    
    let settings = getSettings();

    if(settings)
    {
        for (let favorite of settings.favorites)
        {
            const petCard = document.createElement("pet-card");
            petCard.dataset.page = "favorites";
    
            petCard.dataset.id = favorite.id;
            petCard.dataset.name = favorite.name ?? "No name found";
            petCard.dataset.img = favorite.img ?? "";
            petCard.dataset.description = favorite.description ?? "";
            petCard.dataset.link = favorite.link ?? "";
    
            results.appendChild(petCard);
        }
    }
}

function clearFavorites()
{
    let settings = getSettings();
    if (settings)
    {
        settings.favorites = [];
        localStorage.setItem(localStorageKey, JSON.stringify(settings));
    }
    showFavorites();
}