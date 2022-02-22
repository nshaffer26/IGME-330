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

export { getAPIAccessHeaders, getSettings };