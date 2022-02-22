let apiKey = "FwBlz0h5e87uRhakg4Y095bPOZP5493K4vjjsdybmpZoLSEmFN";
let apiSecret = "p8manHfrHkyNDO3qmmRdNRIHn2kcFydFoLpcXobw";

let localStorageKey = "njs7772-p1-settings";

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
        const authHeaders = {
            headers: {
                Authorization: `${apiTokenType} ${apiAccessToken}`
            }
        };

        return authHeaders
    }
    catch (e)
    {
        console.log(e);
    }
}

function getSettings()
{
    let storedSettings = localStorage.getItem(localStorageKey);
    if (storedSettings)
    {
        storedSettings = JSON.parse(storedSettings);
    }

    return storedSettings;
}
function setSettings(newSettings)
{
    localStorage.setItem(localStorageKey, JSON.stringify(newSettings));
}

function addFavorite(petCard)
{
    petCard.favorite = true;
    petCard.icon.style.filter = "invert(84%) sepia(35%) saturate(2957%) hue-rotate(359deg) brightness(102%) contrast(109%)";

    // Settings will always exist when addFavorite is called
    let settings = getSettings();
    let exists = false;
    for (let favorite of settings.favorites)
    {
        if (favorite.id == petCard.pet.id)
        {
            exists = true;
            break;
        }
    }
    if (!exists)
    {
        settings.favorites.push(petCard.pet);
        setSettings(settings);
    }
    else
    {
        removeFavorite(petCard);
    }
}
function removeFavorite(petCard)
{
    petCard.favorite = false;
    petCard.icon.style.filter = "";

    // Settings will always exist when removeFavorite is called
    let settings = getSettings();
    for (let i = 0; i < settings.favorites.length; i += 1)
    {
        if (petCard.pet.id == settings.favorites[i].id)
        {
            settings.favorites.splice(i, 1);
            break;
        }
    }
    setSettings(settings);
}

export { getAPIAccessHeaders, getSettings, setSettings, addFavorite, removeFavorite };