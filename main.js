import {BaseComponent, Application} from './new-angular.js';

class MyComponent extends BaseComponent {
    constructor() {
        super("MyComponent");
        this.count = 0;
        this.template = () => `<h1>${this.count}</h1>`;
    }
}

const app = new Application();

const component = app.createComponent(new MyComponent());

app.run(component);
// app.tick();

setTimeout(() => {
    component.count += 1;
});