import {BaseComponent, Application} from './new-angular.js';
import {setTimeoutPatch} from './new-zonejs/patch-settimeout.js';

class MyComponent extends BaseComponent {
    constructor() {
        super("MyComponent");
        this.count = 0;
        this.template = () => `<h1>${this.count}</h1>`;
    }
}

const app = new Application();

const component = app.createComponent(new MyComponent());

// Change the state of the component and trigger-CD:
// app.run(component);
// app.tick();

/* ---- OR ---- */

setTimeoutPatch();
setTimeout(() => {
    component.count += 1;
});