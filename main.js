import {BaseComponent, Application} from './new-angular/index.js';
import {setTimeoutPatch} from './new-zonejs/patch-settimeout.js';
import {queueMicrotaskPatch} from "./new-zonejs/patch-queue-microtask.js";
import {addEventListenerPatch} from "./new-zonejs/patch-event-listener.js";

setTimeoutPatch();
queueMicrotaskPatch();
addEventListenerPatch();

class MyComponent extends BaseComponent {
    count = 0;
    updateCount = () => {
        this.count++;
    }
    templateStr = `<button (click)="{{updateCount}}">The count is: {{count}}!</button>`;
}

const app = new Application();

const component = app.createComponent(new MyComponent());

app.run(component);

// Change the state of the component and trigger-CD:
// component.count += 1;
// app.tick();

/* ---- OR ---- */

setTimeout(() => {
    component.count += 1;
});
