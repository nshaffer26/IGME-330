/*
    AUTHOR: Nicholas Shaffer
    DATE: 1/19/2022
*/

let words1, words2, words3;

const url = "data/babble-data.csv";
const xhr = new XMLHttpRequest();
xhr.onload = (e) =>
{
    const text = e.target.responseText;

    [words1, words2, words3] = text.split("\n");
    words1 = words1.split(",");
    words2 = words2.split(",");
    words3 = words3.split(",");

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

document.querySelector("#give-one").addEventListener("click", function () { generateTechnobabble(1) });
document.querySelector("#give-five").addEventListener("click", function () { generateTechnobabble(5) });