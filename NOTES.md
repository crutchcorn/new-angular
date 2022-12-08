# Compiler takes template string, turns into function

https://blog.angular.io/how-the-angular-compiler-works-42111f9d2549

```
import {Component} from '@angular/core';

@Component({
  selector: 'app-cmp',
  template: '<span>Your name is {{name}}</span>',
})
export class AppCmp {
  name = 'Alex';
}
```

```
import { Component } from '@angular/core';                                      
import * as i0 from "@angular/core";

export class AppCmp {
    constructor() {
        this.name = 'Alex';
    }
}                                                                               
AppCmp.ɵfac = function AppCmp_Factory(t) { return new (t || AppCmp)(); };
AppCmp.ɵcmp = i0.ɵɵdefineComponent({
  type: AppCmp,
  selectors: [["app-cmp"]],
  decls: 2,
  vars: 1,
  template: function AppCmp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelementStart(0, "span");
      i0.ɵɵtext(1);
      i0.ɵɵelementEnd();
    }
    if (rf & 2) {
      i0.ɵɵadvance(1);
      i0.ɵɵtextInterpolate1("Your name is ", ctx.name, "");
    }
  },
  encapsulation: 2
});                                                   
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppCmp, [{
        type: Component,
        args: [{
                selector: 'app-cmp',
                template: '<span>Your name is {{name}}</span>',
            }]
    }], null, null); })();
```

The important bit here is the `template`

# Template is Ran when the Component is Created

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/render3/instructions/shared.ts#L299

# And when the component is updated

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/render3/instructions/shared.ts#L368


# The component is updated by `detectChanges`

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/render3/instructions/shared.ts#L1770
https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/render3/view_ref.ts#L273-L275

# Which is called from `Application.tick`

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/application_ref.ts#L1001-L1012

# This is why this doesn't work:

```
import { ApplicationRef, Component, NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>Hello {{name}}</h1>
  <button (click)="changeName()">Change Name</button>
  `,
})
export class AppComponent {
  constructor(private ngZone: NgZone, private appRef: ApplicationRef) {}

  name = '';
  changeName() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.name = 'Angular';
      });
    });
  }
}
```

**But this does:**


```
import { ApplicationRef, Component, NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>Hello {{name}}</h1>
  <button (click)="changeName()">Change Name</button>
  `,
})
export class AppComponent {
  constructor(private ngZone: NgZone, private appRef: ApplicationRef) {}

  name = '';
  changeName() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.name = 'Angular';
        this.appRef.tick();
      });
    });
  }
}
```

But wait, if we remove `ngZone` and `ApplicationRef`, but leave in the `setTimeout`, it still works:

```
import { ApplicationRef, Component, NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>Hello {{name}}</h1>
  <button (click)="changeName()">Change Name</button>
  `,
})
export class AppComponent {
  name = '';
  changeName() {
    setTimeout(() => {
      this.name = 'Angular';
    }, 100);
  }
}
```

Why? What calls `tick` in this instance?

# ZoneJS monkeypatches `setTimeout` and other async APIs:

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/browser/browser.ts#L37-L43

This enables the code to call a tick when `setTimeout` is ran.

# But wait... It works even when you remove the `setTimeout`?

```
import { ApplicationRef, Component, NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>Hello {{name}}</h1>
  <button (click)="changeName()">Change Name</button>
  `,
})
export class AppComponent {
  name = '';
  changeName() {
    this.name = 'Angular';
  }
}
```

What calls ApplicationRef.tick in this instance?

# Zone.js also monkey-patches EventTarget.addEventListener to listen for user events

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/browser/browser.ts#L63-L65
https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/common/events.ts#L93-L94

# What about microtasks, like promises and such?

Answer: Zone.js also monkey-patches those APIs, and provides a way to listen for when they are resolved and there is no queue left in the microtask queue.



https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/zone.ts#L1367-L1375
https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/zone.ts#L1377-L1395

These microtasks simply call the current zone's tasks.

Which uses a singleton static instance of the current zone:

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/zone.ts#L738-L740

Which is set during `run`:

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/zone.js/lib/zone.ts#L818-L826

# How does ngZone fit into this?

See, the Application.tick is actually fired when `ngZone`'s `onMicrotaskEmpty` is fired.

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/application_ref.ts#L766-L772

This is defined by `ngZone`, which is a fork of Zone.js but with listeners to trigger `Application.tick`.

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/zone/ng_zone.ts#L110

Which is emitted when the microtask queue is empty:

https://github.com/angular/angular/blob/a6849f27af129588091f635c6ae7a326241344fc/packages/core/src/zone/ng_zone.ts#LL341C12-L341C28


# This is why you're able to get an application tick, even when `test` is an empty function

```typescript
import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <button (click)="test()">Test</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private zone: NgZone) {
    zone.onMicrotaskEmpty.subscribe({
      next: () => {
        console.log('EMPTY MICROTASK, RUN TICK');
      },
    });
  }

  test() {}
}
```

- Angular compiler takes the template string and converts it to a function
- Zone.js monkey-patches `addEventListener`
- This function is called when the button is clicked
- The monkey-patch adds to the task queue
- Once this task is executed and the queue is empty, ngZone will notice that it's empty
- ngZone will emit the `onMicrotaskEmpty` event
- The `onMicrotaskEmpty` event triggers the `Application.tick` method
- The `Application.tick` method will `detectChanges`
- The `detectChanges` method will run the template function with the new data
- The template function will update the DOM
