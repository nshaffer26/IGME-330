import Pet from "./Pet.js";
import { getAPIAccessHeaders, getSettings, setSettings, addFavorite, removeFavorite } from "./utils.js";

let url = "https://api.petfinder.com";
let page = 1;
let maxPages;

let typeControl = document.querySelector("#controls-type");
let breedControl = document.querySelector("#controls-breed");
let favorites = [];
let search = document.querySelector("#controls-search");
search.addEventListener("click", getSearchResults);

document.querySelector("#results-pagination").style.display = "none";
let next = document.querySelector("#results-next");
let prev = document.querySelector("#results-prev");
next.addEventListener("click", nextPage);
prev.addEventListener("click", prevPage);
[next, prev].forEach(button => button.addEventListener("click", getSearchResults));

let danger = document.querySelector("#results-danger");
danger.parentNode.style.display = "none";

let settings = getSettings();
if (settings)
{
    typeControl.value = settings.type;
    breedControl.value = settings.breed;
    favorites = settings.favorites;
    getSearchResults();
}

async function getSearchResults()
{
    settings = getSettings();
    if (settings)
    {
        favorites = settings.favorites;
    }

    let results = document.querySelector("#results");
    results.innerHTML = "";

    let type = typeControl.value;
    let breed = breedControl.value;

    settings = {
        type: type,
        breed: breed,
        favorites: favorites
    }
    setSettings(settings);

    let response;
    let json;

    danger.parentNode.style.display = "none";

    if (breed == "")
    {
        response = await fetch(`${url}/v2/animals?type=${type}&page=${page}`, await getAPIAccessHeaders());
        json = await response.json();
    }
    else
    {
        let isValidBreed = false;
        let allBreeds = await fetch(`${url}/v2/types/${type}/breeds`, await getAPIAccessHeaders());
        json = await allBreeds.json();
        for (let b of json.breeds)
        {
            if (b.name.toLowerCase() === breed.toLowerCase().trim())
            {
                isValidBreed = true;
                breed = breed.replace(" ", "-");
                break;
            }
            if (b.name.toLowerCase().includes(breed.toLowerCase().trim()))
            {
                isValidBreed = true;
                breed = b.name.replace(" / ", " ").replace(/ /g, "-");
                break;
            }
        }

        if (isValidBreed)
        {
            response = await fetch(`${url}/v2/animals?type=${type}&breed=${breed}&page=${page}`, await getAPIAccessHeaders());
            json = await response.json();
            console.log(json);
            console.log(`${url}/v2/animals?type=${type}&breed=${breed}&page=${page}`);
        }
        else
        {
            danger.parentNode.style.display = "block";
            danger.innerHTML = "Invalid breed, showing all breeds"
            response = await fetch(`${url}/v2/animals?type=${type}&page=${page}`, await getAPIAccessHeaders());
            json = await response.json();
        }
    }

    document.querySelector("#results-pagination").style.display = "block";

    maxPages = json.pagination.total_pages;

    prev.disabled = false;
    next.disabled = false;
    if (page == 1)
    {
        prev.disabled = true;
    }
    if (page == maxPages)
    {
        next.disabled = true;
    }

    console.log(json);
    showResults(json);
}

function showResults(json)
{
    let results = document.querySelector("#results");
    results.innerHTML = "";

    for (let animal of json.animals)
    {
        let img;
        if (animal.photos.length != 0)
        {
            img = animal.photos[0].medium ?? "";
        }

        const petCard = document.createElement("pet-card");

        const pet = new Pet(animal.id, animal.name, img, animal.breeds.primary, animal.gender, animal.age, animal.url);

        for (let favorite of settings.favorites)
        {
            if (favorite.id == animal.id)
            {
                petCard.dataset.favorite = true;
                break;
            }
        }

        petCard.pet = pet;
        petCard.callback = petCard => addFavorite(petCard);

        results.appendChild(petCard);
    }
};

function nextPage() { page += 1; }
function prevPage() { page -= 1; }

// TODO: For testing purposes only, remove later
// let response = await fetch("https://api.petfinder.com/v2/types/dog/breeds", await getAPIAccessHeaders());
// let json = await response.json();
// console.log("TEST: ", json.types[0]._links.breeds.href);
// response = await fetch("https://api.petfinder.com" + json.types[0]._links.breeds.href, await getAPIAccessHeaders());
// json = await response.json();
// console.log("TEST: ", json);

// response = await fetch("https://api.petfinder.com/v2/animals?type=scales-fins-other&breed=King-Milk&page=1", await getAPIAccessHeaders());
// json = await response.json();
// console.log("TEST: ", json);
// console.log(getSettings());