import { html, TemplateElement, defineElement } from '@webtides/element-js';

/**
 * This is my simple element :) :)
 */
export default class MyElement extends TemplateElement {
    styles() {
        return [`
            my-element {
                display: block;
                padding: 25px;
                color: var(--my-element-text-color, #000);
            }
        `];
    }

    properties() {
        return {
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

defineElement('my-element', MyElement);
