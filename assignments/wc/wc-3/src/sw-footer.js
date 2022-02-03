const template = document.createElement("template");
template.innerHTML = `
<style>
footer {
    color: white;
    background-color: black;
    padding: .5rem;
    margin-top: .5rem;
}
</style>

<footer>
    &copy; 2021 Ace Coder
</footer>
`;

class SWFooter extends HTMLElement
{
    constructor()
    {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("sw-footer", SWFooter);