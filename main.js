import {BaseComponent, Application, compileToFunction} from './new-angular.js';
import {setTimeoutPatch} from './new-zonejs/patch-settimeout.js';

class MyComponent extends BaseComponent {
    constructor() {
        super("MyComponent");
        this.count = 0;
        this.template = () => compileToFunction(`<button (click)="$1">$2</button>`, [() => {
            setTimeout(() => {
                this.count++;
            })
        }, this.count]);
    }
}

const app = new Application();

const component = app.createComponent(new MyComponent());

app.run(component);

// Change the state of the component and trigger-CD:
// component.count += 1;
// app.tick();

/* ---- OR ---- */

setTimeoutPatch();
setTimeout(() => {
    component.count += 1;
});
