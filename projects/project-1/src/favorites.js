import Pet from "./Pet.js";
import { getAPIAccessHeaders, getSettings, setSettings, addFavorite, removeFavorite } from "./utils.js";

let clear = document.querySelector("#controls-clear");
clear.addEventListener("click", clearFavorites);

showFavorites();

function showFavorites()
{
    results.innerHTML = "";

    let settings = getSettings();
    if (settings)
    {
        for (let fav of settings.favorites)
        {
            const petCard = document.createElement("pet-card");
            
            const pet = new Pet(fav.id, fav.name, fav.image, fav.breed, fav.gender, fav.age, fav.link);

            petCard.pet = pet;
            petCard.callback = petCard => 
            {
                removeFavorite(petCard);
                petCard.remove();
            }

            results.appendChild(petCard);

            petCard.button.className = "delete";
            petCard.button.innerHTML = "";
        }
    }
}

function clearFavorites()
{
    let settings = getSettings();
    if (settings)
    {
        settings.favorites = [];
        setSettings(settings);
    }
    showFavorites();
}