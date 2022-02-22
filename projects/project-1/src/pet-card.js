import Pet from "./Pet.js";

const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w=="
    crossorigin="anonymous" referrerpolicy="no-referrer">

<style>
    .card-image {
        width: 100%;
        height: 300px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        overflow: hidden;
    }
    .card-content {
        min-height: 200px;
    }

    #card-button {
        z-index: 100;
        position: absolute;
        top: 10px;
        right: 10px;
    }
    #card-button img {
        width: 100px;
    }
</style>

<div class="card">
    <div id="card-image" class="card-image">
        <button id="card-button" class="button">
            <span class="icon">
                <img src="./images/star-solid.svg">
            </span>
        </button>
    </div>
    <div class="card-content">
        <div class="media">
            <div class="media-content">
                <p id="card-name" class="title is-4"></p>
            </div>
        </div>
        <div class="content">
            <p id="card-breed"></p>
            <p id="card-age"></p>
            <p id="card-gender"></p>
            <a id="card-link">See More</a>
        </div>
    </div>
</div>
`;

class PetCard extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.pet = new Pet("0000", "Unavailable", "./images/no-image.png", "Unavailable", "Unavailable", "Unavailable", "#");
        this.callback = pet => console.log("Default Pet Callback", pet);
    }

    connectedCallback()
    {
        this.favorite = this.getAttribute("data-favorite");

        this.img = this.shadowRoot.querySelector("#card-image");
        this.name = this.shadowRoot.querySelector("#card-name");
        this.breed = this.shadowRoot.querySelector("#card-breed");
        this.age = this.shadowRoot.querySelector("#card-age");
        this.gender = this.shadowRoot.querySelector("#card-gender");
        this.link = this.shadowRoot.querySelector("#card-link");

        this.button = this.shadowRoot.querySelector("#card-button");
        this.icon = this.shadowRoot.querySelector("#card-button img")

        this.button.onclick = () => this.callback(this);

        this.render();
    }
    disconnectedCallback()
    {
        this.button.onclick = null;
    }

    // TODO: Necessary?
    // static get observedAttributes()
    // {
    //     return ["data-favorite"];
    // }
    // attributeChangedCallback(attributeName, oldVal, newVal)
    // {
    //     console.log(attributeName, oldVal, newVal);
    //     this.render();
    // }

    render()
    {
        const image = this.pet.image ? this.pet.image : "./images/no-image.png";

        this.img.style["background-image"] = `url(${image})`;
        this.name.innerHTML = this.pet.name;
        this.breed.innerHTML = this.pet.breed;
        this.age.innerHTML = this.pet.age;
        this.gender.innerHTML = this.pet.gender;
        this.link.href = this.pet.link;

        if (this.favorite)
        {
            this.icon.style.filter = "invert(84%) sepia(35%) saturate(2957%) hue-rotate(359deg) brightness(102%) contrast(109%)";
        }
    }
}

customElements.define("pet-card", PetCard);