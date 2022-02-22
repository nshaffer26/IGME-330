let localStorageKey = "njs7772-p1-settings";

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
            <p id="card-description"></p>
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
    }

    connectedCallback()
    {
        this.id = this.getAttribute("data-id");
        this.favorite = this.getAttribute("data-favorite");

        this.name = this.shadowRoot.querySelector("#card-name");
        this.button = this.shadowRoot.querySelector("#card-button");
        this.icon = this.shadowRoot.querySelector("#card-button img")
        this.img = this.shadowRoot.querySelector("#card-image");
        this.description = this.shadowRoot.querySelector("#card-description");
        this.link = this.shadowRoot.querySelector("#card-link");

        if (this.dataset.page == "app")
        {
            this.button.onclick = () => this.addFavorite();
        }
        if (this.dataset.page == "favorites")
        {
            this.button.className = "delete";
            this.button.innerHTML = "";
            this.button.onclick = () =>
            {
                this.removeFavorite(this.id);
                this.remove();
            }
        }

        this.render();
    }
    disconnectedCallback()
    {
        this.button.onclick = null;
    }

    addFavorite()
    {
        this.favorite = true;
        this.icon.style.filter = "invert(84%) sepia(35%) saturate(2957%) hue-rotate(359deg) brightness(102%) contrast(109%)";

        let settings = localStorage.getItem(localStorageKey);
        if (settings)
        {
            settings = JSON.parse(settings);
            let exists = false;
            for (let favorite of settings.favorites)
            {
                if (favorite.id == this.id)
                {
                    exists = true;
                    break;
                }
            }

            if (!exists)
            {
                let favorite = {
                    id: this.id,
                    name: this.getAttribute("data-name"),
                    img: this.getAttribute("data-img"),
                    description: this.getAttribute("data-description"),
                    link: this.getAttribute("data-link")
                };
                settings.favorites.push(favorite);
                localStorage.setItem(localStorageKey, JSON.stringify(settings));
            }
            else
            {
                this.removeFavorite(this.id)
            }
        }
    }
    removeFavorite(id)
    {
        this.favorite = false;
        this.icon.style.filter = "";

        let settings = localStorage.getItem(localStorageKey);
        if (settings)
        {
            settings = JSON.parse(settings);
            for (let i = 0; i < settings.favorites.length; i += 1)
            {
                if (id == settings.favorites[i].id)
                {
                    settings.favorites.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem(localStorageKey, JSON.stringify(settings));
        }
    }

    // TODO: Causing an error?
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
        const name = this.getAttribute("data-name");
        const img = this.getAttribute("data-img") ? this.getAttribute("data-img") : "./images/no-image.png";
        const description = this.getAttribute("data-description") ? this.getAttribute("data-description") : "Description not available";
        const link = this.getAttribute("data-link");

        this.name.innerHTML = name;
        this.img.style["background-image"] = `url(${img})`;
        this.description.innerHTML = description;
        this.link.href = link;

        if (this.favorite)
        {
            this.icon.style.filter = "invert(84%) sepia(35%) saturate(2957%) hue-rotate(359deg) brightness(102%) contrast(109%)";
        }
    }
}

customElements.define("pet-card", PetCard);