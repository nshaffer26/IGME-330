const template = document.createElement("template");
template.innerHTML = `
<style>
.sw-card {
    height: 340px;
    width: 170px;
    border: 1px solid gray;
    padding: .5rem;
    background-color: #f4f4f4;
    overflow: auto;
    font-size: .7rem;
    position: relative;
}
.sw-card h2 {
    font-size: 1.1rem;
    font-family: SfDistantGalaxy, sans-serif;
    letter-spacing: .67px;
    line-height: 1.2;
    margin-top: 0;
}
.sw-card img {
    width: 100px;
}
.sw-card button {
    border-radius: 1px;
    padding: 2px;
    position: absolute;
    top: 1px;
    right: 1px;
    opacity: 0.2;
}
.sw-card button:hover {
    opacity: 1;
}
</style>

<div class="sw-card">
    <h2></h2>
    <button>X</button>
    <img alt="mugshot">
    <p id="swcHeight"></p>
    <p id="swcMass"></p>
    <p id="swcHomeworld"></p>
    <p id="swcSpecies"></p>
    <div id="swcApprentices"><div>
</div>
`;

class SWCard extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.h2 = this.shadowRoot.querySelector("h2");
        this.img = this.shadowRoot.querySelector("img");
        this.p1 = this.shadowRoot.querySelector("#swcHeight");
        this.p2 = this.shadowRoot.querySelector("#swcMass");
        this.p3 = this.shadowRoot.querySelector("#swcHomeworld");
        this.p4 = this.shadowRoot.querySelector("#swcSpecies");
        this.p5 = this.shadowRoot.querySelector("#swcApprentices");
        this.button = this.shadowRoot.querySelector("button");
    }

    connectedCallback()
    {
        this.button.onclick = () => this.remove();
        this.render();
    }
    disconnectedCallback()
    {
        this.button.onclick = null;
    }

    attributeChangedCallback(attributeName, oldVal, newVal)
    {
        console.log(attributeName, oldVal, newVal);
        this.render();
    }

    static get observedAttributes()
    {
        return ["data-name", "data-height", "data-mass", "data-homeworld", "data-species", "data-apprentices", "data-image"];
    }

    render()
    {
        const name = this.getAttribute("data-name") ? this.getAttribute("data-name") : "<i>...character name...</i>";
        const height = this.getAttribute("data-height") ? this.getAttribute("data-height") : "0";
        const mass = this.getAttribute("data-mass") ? this.getAttribute("data-mass") : "0";
        const home = this.getAttribute("data-homeworld") ? this.getAttribute("data-homeworld") : "Unknown";
        const species = this.getAttribute("data-species") ? this.getAttribute("data-species") : "Unknown";
        const apprentices = this.getAttribute("data-apprentices") ? this.getAttribute("data-apprentices").split(",").join("</li><li>") : "None";
        const imageURL = this.getAttribute("data-image") ? this.getAttribute("data-image") : "images/catimage-no-image.png";

        this.h2.innerHTML = `${name}`;
        this.p1.innerHTML = `Height: ${height}`;
        this.p2.innerHTML = `Mass: ${mass}`;
        this.p3.innerHTML = `Homeworld: ${home}`;
        this.p4.innerHTML = `Species: ${species}`;
        this.p5.innerHTML = `Apprentices:<ul><li>${apprentices}</li></ul>`;
        this.img.src = imageURL;
    }
}

customElements.define("sw-card", SWCard);