import "./app-nav.js";
import "./app-footer.js";

let apiKey = "FwBlz0h5e87uRhakg4Y095bPOZP5493K4vjjsdybmpZoLSEmFN";
let apiSecret = "p8manHfrHkyNDO3qmmRdNRIHn2kcFydFoLpcXobw";

if(document.querySelector("#random-pet"))
{
    loadRandomPetImage();
}

async function getAPIAccessHeaders()
{
    try
    {
        let response = await fetch("https://api.petfinder.com/v2/oauth2/token", {
            body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        });

        if (!response.ok)
        {
            throw new Error(response.status);
        }

        let json = await response.json();

        const apiAccessToken = json.access_token;
        const apiTokenType = json.token_type;
        const authHeaders = {headers: {
            Authorization: `${apiTokenType} ${apiAccessToken}`
        }};

        return authHeaders
    }
    catch (e)
    {
        console.log(e);
    }
}

async function loadRandomPetImage()
{
    let response = await fetch("https://api.petfinder.com/v2/animals?sort=random", await getAPIAccessHeaders());
    let json = await response.json();
    
    let image;
    let link;
    while(!image)
    {
        let numResults = json.pagination.count_per_page;

        let pet = json.animals[Math.floor(Math.random() * numResults)]
        if(pet.photos.length === 0)
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