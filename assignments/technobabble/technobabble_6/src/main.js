/*
    AUTHOR: Nicholas Shaffer
    DATE: 1/19/2022
*/

let words1, words2, words3;

const url = "data/babble-data.json";
const xhr = new XMLHttpRequest();
xhr.onload = (e) =>
{
    let json = "";
    try
    {
        json = JSON.parse(e.target.responseText);
    }
    catch
    {
        document.querySelector("#output").innerHTML = "Error: JSON invalid";
        return;
    }

    words1 = json.word1;
    words2 = json.word2;
    words3 = json.word3;

    generateTechnobabble(1);
};
xhr.onerror = e => console.log(`In onerror - HTTP Status Code = ${e.target.status}`);
xhr.open("GET", url);
xhr.send();

function generateTechnobabble(num)
{
    let output = "";
    for (let i = 0; i < num; i++)
    {
        output += `${selectRandomWord(words1)} ${selectRandomWord(words2)} ${selectRandomWord(words3)}<br>`;
    }
    document.querySelector("#output").innerHTML = output;
}
function selectRandomWord(list)
{
    return list[Math.floor(Math.random() * list.length)];
}

document.querySelector("#give-one").addEventListener("click", () => generateTechnobabble(1));
document.querySelector("#give-five").addEventListener("click", () => generateTechnobabble(5));