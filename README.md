# New Angular

This codebase is a re-implementation of Angular from scratch (no deps) for educational purposes.

While this codebase is incomplete, it's a representation of how [Angular and Zone.js works under-the-hood.](https://unicorn-utterances.com/posts/angular-internals-zonejs)

## Example

```typescript
import {BaseComponent, Application} from './new-angular/index.js';
import {setTimeoutPatch} from './new-zonejs/patch-settimeout.js';
import {queueMicrotaskPatch} from "./new-zonejs/patch-queue-microtask.js";
import {addEventListenerPatch} from "./new-zonejs/patch-event-listener.js";

setTimeoutPatch();
queueMicrotaskPatch();
addEventListenerPatch();

class MyComponent extends BaseComponent {
  constructor() {
    super("MyComponent");
  }
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
component.count += 1;
app.tick();

/* ---- OR ---- */

setTimeout(() => {
  component.count += 1;
});
```

## Parts of the Code

This codebase is broken into a few different components:

- [Naive implementation of Zone.js](./new-zonejs/index.js)
- [Naive implementation of Zone.js patches (like setTimeout)](./new-zonejs/patch-settimeout.js)
- [Naive implementation of Angular's compiler](./new-angular/compiler.js)
- [Naive implementation of Angular's renderer, change detection, etc](./new-angular/index.js)

> Want to see more like this? [Read through my "Framework Field Guide" book series](https://framework.guide) which will teach you how to write React, Angular, and Vue from scratch.
