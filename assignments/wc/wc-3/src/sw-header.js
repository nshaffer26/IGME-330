const template = document.createElement("template");
template.innerHTML = `
<style>
header {
    color: white;
    background-color: black;
    padding: .5em;
    user-select: none;
    margin-bottom: .5rem;
}
header h1 {
    font-family: SfDistantGalaxy,sans-serif;
    letter-spacing: 1px;
}
header span {
    font-variant: small-caps;
    font-weight: bolder;
    font-family: sans-serif;
    font-style: italic;
}
</style>

<header>
    <h1>Star Wars Character Finder</h1>
    <span>I've got a bad feeling about this ...</span>
</header>
`;

class SWHeader extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.h1 = this.shadowRoot.querySelector("h1");
        this.span = this.shadowRoot.querySelector("span");
        this.quotes = ["I've got a bad feeling about this ...", "Will someone get this big walking carpet out of my way?!", "Aren’t you a little short for a stormtrooper?", "I hope you know what you’re doing.", "Oh, it’s not like that at all. He’s my brother.", "We have powerful friends. You’re going to regret this."];
        this.currentQuote = this.randomQuote();
    }

    connectedCallback()
    {
        this.onclick = () =>
        {
            this.currentQuote = this.randomQuote();
            this.render();
        }
        this.render();
    }
    disconnectedCallback()
    {
        this.onclick = null;
    }

    attributeChangedCallback(attributeName, oldVal, newVal)
    {
        console.log(attributeName, oldVal, newVal);
        this.render();
    }

    static get observedAttributes()
    {
        return ["data-title"];
    }

    randomQuote()
    {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    render()
    {
        const title = this.dataset.title ? this.dataset.title : "Star Wars";
        this.h1.innerHTML = `${title}`;
        this.span.innerHTML = `${this.currentQuote}`;
    }
}

customElements.define("sw-header", SWHeader);