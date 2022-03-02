import Pet from "./Pet.js";
import * as map from "./map.js";
import { getAPIAccessHeaders, getSettings, setSettings, addFavorite, removeFavorite } from "./utils.js";

let url = "https://api.petfinder.com";
let page = 1;
let maxPages;

let typeControl = document.querySelector("#controls-type");
let breedControl = document.querySelector("#controls-breed");
let locationControl = document.querySelector("#controls-location");
let distanceControl = document.querySelector("#controls-distance");
let favorites = [];
let search = document.querySelector("#controls-search");
search.addEventListener("click", getSearchResultsList);
document.addEventListener("keyup", e =>
{
    e.preventDefault();
    if (e.key === "Enter")
    {
        search.click();
    }
});

let resultJSON;
let showingList = true;
let mapCenter;
let viewList = document.querySelectorAll(".results-list");
let viewMap = document.querySelectorAll(".results-map");
viewList.forEach(button => button.addEventListener("click", _ =>
{
    showingList = true;
    if (settings)
    {
        settings.controls.showingList = showingList;
        setSettings(settings);
    }
    viewList.forEach(button => button.classList.add("button-active"));
    viewMap.forEach(button => button.classList.remove("button-active"));
    document.querySelectorAll(".results-pagination").forEach(elem => elem.classList.remove("is-hidden"));

    if (resultJSON)
    {
        showResults(resultJSON);
        return;
    }
    search.click();
}));
viewMap.forEach(button => button.addEventListener("click", _ =>
{
    showingList = false;
    if (settings)
    {
        settings.controls.showingList = showingList;
        setSettings(settings);
    }
    viewList.forEach(button => button.classList.remove("button-active"));
    viewMap.forEach(button => button.classList.add("button-active"));

    if (resultJSON)
    {
        showMap(resultJSON);
        return;
    }
    search.click();
}));

document.querySelectorAll(".results-pagination").forEach(elem => elem.classList.add("is-hidden"));
let next = document.querySelectorAll(".results-next");
let prev = document.querySelectorAll(".results-prev");
next.forEach(button => button.addEventListener("click", nextPage));
prev.forEach(button => button.addEventListener("click", prevPage));
[next, prev].forEach(list => list.forEach(button => button.addEventListener("click", getSearchResultsList)));

let danger = document.querySelector("#results-danger");
danger.parentNode.classList.add("is-hidden");
let info = document.querySelector("#results-info");
info.parentNode.classList.add("is-hidden");

let settings = getSettings();
if (settings)
{
    typeControl.value = settings.controls.type;
    breedControl.value = settings.controls.breed;
    locationControl.value = settings.controls.location;
    distanceControl.value = settings.controls.distance;
    showingList = settings.controls.showingList;
    if (showingList)
    {
        viewList.forEach(button => button.classList.add("button-active"));
        viewMap.forEach(button => button.classList.remove("button-active"));
    }
    else
    {
        viewList.forEach(button => button.classList.remove("button-active"));
        viewMap.forEach(button => button.classList.add("button-active"));
    }

    favorites = settings.favorites;

    getSearchResultsList();
}

async function getSearchResultsList()
{
    prev.forEach(button => button.disabled = true);
    next.forEach(button => button.disabled = true);
    search.classList.toggle("is-loading");

    settings = getSettings();
    if (settings)
    {
        favorites = settings.favorites;
    }

    let results = document.querySelector("#results");
    results.innerHTML = "";

    let type = typeControl.value;
    let breed = breedControl.value;
    let location = locationControl.value;
    let distance = distanceControl.value;

    settings = {
        controls: {
            type: type,
            breed: breed,
            location: location,
            distance: distance,
            showingList: showingList
        },
        favorites: favorites
    }
    setSettings(settings);

    let request = `${url}/v2/animals?page=${page}&type=${type}`;
    let response;
    let json;

    danger.parentNode.classList.add("is-hidden");
    info.parentNode.classList.add("is-hidden");

    if (breed)
    {
        request += await testBreed(type, breed);
    }
    if (distance)
    {
        if (location)
        {
            let temp = request;
            request += await testLocation(location);

            if (temp !== request)
            {
                // The location was valid, add the distance
                if (distance > 500)
                {
                    danger.parentNode.classList.remove("is-hidden");
                    danger.innerHTML = "Maximum distance is 500, showing pets in that range";
                    distance = 500;
                }
                request += `&distance=${distance}`;
            }
        }
        else
        {
            danger.parentNode.classList.remove("is-hidden");
            danger.innerHTML = "Must include location if filtering on distance, showing results based on remaining filters";
        }
    }
    else
    {
        if (location)
        {
            request += await testLocation(location);
        }
    }

    console.log(request);
    response = await fetch(request, await getAPIAccessHeaders());
    json = await response.json();

    if (!json.animals || json.animals.length === 0)
    {
        danger.parentNode.classList.remove("is-hidden");
        danger.innerHTML = "No results found, try adjusting your filters";
    }

    document.querySelectorAll(".results-pagination").forEach(elem => elem.classList.remove("is-hidden"));

    maxPages = json.pagination.total_pages;

    prev.forEach(button => button.disabled = false);
    next.forEach(button => button.disabled = false);
    if (page == 1)
    {
        prev.forEach(button => button.disabled = true);
    }
    if (page == maxPages)
    {
        next.forEach(button => button.disabled = true);
    }

    console.log(json);
    resultJSON = json;

    if (showingList)
    {
        showResults(resultJSON);
    }
    else
    {
        showMap(resultJSON);
    }
    search.classList.toggle("is-loading");
}
function showResults(json)
{
    document.querySelector("#map").classList.add("is-hidden");
    document.querySelector("#results").classList.remove("is-hidden");
    info.parentNode.classList.add("is-hidden");

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
        if (animal.breeds.secondary)
        {
            pet.breed = `${animal.breeds.primary}, ${animal.breeds.secondary}`;
        }

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
async function showMap(json)
{
    document.querySelector("#map").classList.remove("is-hidden");
    document.querySelector("#results").classList.add("is-hidden");
    document.querySelectorAll(".results-pagination").forEach(elem => elem.classList.add("is-hidden"));

    if (locationControl.value)
    {
        info.parentNode.classList.remove("is-hidden");
        info.innerHTML = "Showing pets that have address information. To view all pets based on your filters, view as list";
    }
    else
    {
        danger.parentNode.classList.remove("is-hidden");
        danger.innerHTML = "To view pets in your area on the map, enter a location";
    }

    await map.initMap(mapCenter);
    await map.loadMarkers(mapCenter, json);
    map.addMarkersToMap();
}

function nextPage() { page += 1; }
function prevPage() { page -= 1; }

async function testBreed(type, breed)
{
    let isValidBreed = false;
    let allBreeds = await fetch(`${url}/v2/types/${type}/breeds`, await getAPIAccessHeaders());
    let json = await allBreeds.json();
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
        return `&breed=${breed}`;
    }
    else
    {
        danger.parentNode.classList.remove("is-hidden");
        danger.innerHTML = "Invalid breed, showing all breeds";
        return "";
    }
}
async function testLocation(location)
{
    let temp = location.replace(" ", "");
    const zipRegex = new RegExp("^[0-9]{5}$");
    if (zipRegex.test(temp))
    {
        // Possible valid ZIP code
        if (!await testWithAPI(temp))
        {
            // Invalid
            return "";
        }
        location = temp;
    }
    else
    {
        // Possibly valid city, state
        temp = location.trim().replaceAll(" ", "%20");

        if (!await testWithAPI(temp))
        {
            // Invalid
            return "";
        }
        mapCenter = encodeURI(location);
        location = temp;
    }

    async function testWithAPI(loc)
    {
        // Test with API
        try
        {
            let response = await fetch(`https://api.petfinder.com/v2/animals?location=${loc}`, await getAPIAccessHeaders());
            if (!response.ok)
            {
                throw new Error(response.statusText);
            }
        }
        catch (error)
        {
            console.log("Invalid Location", error);
            danger.parentNode.classList.remove("is-hidden");
            danger.innerHTML = "Invalid location, showing results using remaining filters.<br>Locations must be a valid 5-digit ZIP Code or in the form of \"City, State\"";
            return false;
        }
        return true;
    }

    return `&location=${location}`;
}

// TODO: For testing purposes only

// let response = await fetch("https://api.petfinder.com/v2/animals?location=New York,%20New%20York&distance=500", await getAPIAccessHeaders());
// let json = await response.json();
// console.log("TEST: ", json);

// response = await fetch("https://api.petfinder.com/v2/organizations/NY23", await getAPIAccessHeaders());
// json = await response.json();
// console.log("TEST: ", json);

// response = await fetch("https://api.petfinder.com/v2/animals?type=scales-fins-other&breed=King-Milk&page=1", await getAPIAccessHeaders());
// json = await response.json();
// console.log("TEST: ", json);
// console.log(getSettings());