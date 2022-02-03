// all.json is from https://akabab.github.io/starwars-api/

import {loadFile} from "./utils.js";
import "./sw-header.js";
import "./sw-card.js";
import "./sw-footer.js";

let swcJSON = {}; // "Star Wars Character JSON"

const showCharacter = swcObj =>
{
    const swCard = document.createElement("sw-card");
    swCard.dataset.name = swcObj.name ?? "No name found";
    swCard.dataset.height = swcObj.height ?? "?";
    swCard.dataset.mass = swcObj.mass ?? "?";
    swCard.dataset.homeworld = swcObj.homeworld ?? "?";
    swCard.dataset.species = swcObj.species ?? "?";
    swCard.dataset.apprentices = swcObj.apprentices ?? "None";
    swCard.dataset.image = swcObj.image ?? "";
    document.querySelector(".card-list").appendChild(swCard);
};

const selectChange = e =>
{
    const swcID = e.target.value;
    if (swcID == 0) return; // if it's the first <option>, return
    const swcObj = swcJSON[swcID]; // "Star Wars Character Object"
    if (swcObj) showCharacter(swcObj);
};

const jsonLoaded = json =>
{
    // `json` is actually an array (legal JSON can be either an array or an object at its root)
    // we'll turn this array into the `swcJSON` object, where the character id's are the keys of the object
    // this will make it easier to access the characters when the user chooses one

    // 1 - convert the array to an object
    json.forEach(obj => swcJSON[obj.id] = obj);

    // 2 - add something to represent the first <option> of the select 
    swcJSON["0"] = { "id": 0, "name": "... choose a character ..." };

    // 3 - create the <option> elements and hook up the `onchange` event
    const optionHTML = Object.keys(swcJSON).map(swc => `<option value="${swcJSON[swc].id}">${swcJSON[swc].name}</option>`).join("");
    const select = document.querySelector("#character-select");
    select.innerHTML = optionHTML;
    select.onchange = selectChange;
    showCharacter({ name: "Stormtrooper Tim", height: 100, mass: 30 })
};

const init = () =>
{
    const url = "data/all.json";
    loadFile(url, jsonLoaded);
};

window.onload = init;