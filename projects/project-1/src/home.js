import { getAPIAccessHeaders } from "./utils.js";

loadRandomPetImage();

async function loadRandomPetImage()
{
    let response = await fetch("https://api.petfinder.com/v2/animals?sort=random", await getAPIAccessHeaders());
    let json = await response.json();

    let image;
    let link;
    while (!image)
    {
        let numResults = json.pagination.count_per_page;

        let pet = json.animals[Math.floor(Math.random() * numResults)]
        if (pet.photos.length === 0)
        {
            continue;
        }

        let numPhotos = pet.photos.length;
        image = pet.photos[Math.floor(Math.random() * numPhotos)].medium;
        link = pet.url;
    }

    document.querySelector("#random-pet").src = image;
    document.querySelector("#random-pet-link").href = link;
}

// TODO: For testing purposes only, remove later
let response = await fetch("https://api.petfinder.com/v2/types", await getAPIAccessHeaders());
let json = await response.json();
console.log(json);

response = await fetch("https://api.petfinder.com/v2/types", await getAPIAccessHeaders());
json = await response.json();
console.log(json);