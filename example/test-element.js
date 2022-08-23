import { html, TemplateElement, defineElement } from '@webtides/element-js';

export default class TestElement extends TemplateElement {
    static get styles() {
        return css`
            :host {
                display: block;
                padding: 25px;
                color: var(--my-element-text-color, #000);
            }
        `;
    }

    properties() {
        return {
            /*
            The title
            @values
             */
            title: { type: String },
            counter: { type: Number },
        };
    }

    _incrementCounter() {
        this.counter += 1;
    }

    template() {
        return html`
            <h2>${this.title} Nr. ${this.counter}!</h2>
            <button @click=${this._incrementCounter}>increment</button>
        `;
    }
}

defineElement('test-element', TestElement);
