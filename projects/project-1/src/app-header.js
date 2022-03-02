const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">

<style>
    .hero {
        background-color: #2CB3F2;
    }
    .hero h1, .hero h2 {
        color: white;
    }
</style>

<header class="hero is-large p-4">
    <div class="hero-head">
        <h1 class="title"><slot name="title"></slot></h1>
        <h2 class="subtitle"><slot name="subtitle"></slot></h2>
    </div>
</header>
`;

class AppHeader extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("app-header", AppHeader);