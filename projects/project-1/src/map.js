let accessToken = "pk.eyJ1IjoibnNoYWZmZXIiLCJhIjoiY2t6bjQ3aGlnMDB5bzJ4bjJxejB6Y3lzdiJ9.wdTnYpaAWMwhXPd3QD7Ziw";
let map;
let geojson = {
    type: 'FeatureCollection',
    features: []
};

// Initialize the map
async function initMap(center)
{
    mapboxgl.accessToken = accessToken;

    if(!center)
    {
        center = [-77.67454147338866, 43.08484339838443];
    }
    else
    {
        center = await getCenter(center);
    }
    
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: center,
        zoom: 10
    });
    map.addControl(new mapboxgl.NavigationControl());
}

// Create markers to place on the map
async function loadMarkers(center, animals)
{
    geojson.features = [];
    center = await getCenter(center);

    let addresses = {};
    for (let animal of animals.animals)
    {
        let address = animal.contact.address.address1 ?? animal.contact.address.postcode;
        if (address)
        {
            let response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(address)}.json?proximity=${center}&access_token=${accessToken}`);
            let json = await response.json();

            let coordinates = json.features[0].center;

            if (!addresses[address])
            {
                addresses[address] = {
                    address: address,
                    coordinates: coordinates,
                    animals: []
                };
            }
            addresses[address].address = address;
            addresses[address].coordinates = coordinates;
            addresses[address].animals.push({
                name: animal.name,
                link: animal.url
            });
        }
    }
    console.log(addresses);

    // Convert this data to GeoJSON
    for (let address of Object.keys(addresses))
    {
        // Create an "empty" GeoJSON feature
        const newFeature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: []
            },
            properties: {
                title: "",
                description: ""
            }
        };

        // Add properties to this shop
        newFeature.geometry.coordinates[0] = addresses[address].coordinates[0];
        newFeature.geometry.coordinates[1] = addresses[address].coordinates[1];
        newFeature.properties.title = addresses[address].address;

        let ul = "<ul>";
        for (let animal of addresses[address].animals)
        {
            ul += `<li>${animal.name}: <a href="${animal.link}">See More</a></li>`;
        }
        ul += "</ul>";
        newFeature.properties.description = ul;

        // Add it to the list of features
        geojson.features.push(newFeature);
    }
}

function addMarker(coordinates, title, description, className, id = "")
{
    let el = document.createElement("div");
    el.className = className;
    el.id = id;

    new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${title}</h3><br>${description}`))
        .addTo(map);
}

// Add markers to map
function addMarkersToMap()
{
    for (const feature of geojson.features)
    {
        addMarker(feature.geometry.coordinates, feature.properties.title, feature.properties.description, "marker");
    }
}

async function getCenter(center)
{
    center = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${center}.json?access_token=${accessToken}`);
    let json = await center.json();
    return json.features[0].center;
}

export { initMap, loadMarkers, addMarkersToMap, addMarker };