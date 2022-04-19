const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    
<style>
    #icon {
        width: 100%;
    }
</style>

<nav class="navbar is-white">
    <div class="navbar-brand">
        <a class="navbar-item" href="home.html">
            <img id="icon" src="./images/icon.png" alt="">
        </a>
        <a class="navbar-burger" id="burger">
            <span></span>
            <span></span>
            <span></span>
        </a>
    </div>
    <div class="navbar-menu" id="nav-links">
        <div class="navbar-start">
            <a id="home" class="navbar-item is-hoverable" href="home.html">Home</a>
            <a id="app" class="navbar-item is-hoverable" href="app.html">App</a>
            <a id="documentation" class="navbar-item is-hoverable" href="documentation.html">Documentation</a>
        </div>
    </div>
</nav>
`;

class AppNav extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.currentPage = this.shadowRoot.querySelector("#" + this.dataset.page);
        this.currentPage.classList.remove("is-hoverable");
        this.currentPage.classList.add("has-text-weight-bold");
        this.currentPage.style["border-bottom"] = "1px solid #FC6F50"

        this.links = this.shadowRoot.querySelectorAll("#nav-links a");

        // Mobile Menu
        this.burger = this.shadowRoot.querySelector("#burger");
        this.navMenu = this.shadowRoot.querySelector("#nav-links");

        this.burger.addEventListener("click", () => this.navMenu.classList.toggle("is-active"));
    }
}

customElements.define("app-nav", AppNav);