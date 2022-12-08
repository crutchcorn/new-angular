import { Zone } from './new-zonejs/index.js';
import {setTimeoutPatch} from './new-zonejs/patch-settimeout.js';

class Renderer {
    // Render the template of a component
    render(component) {
        const container = document.getElementById("root");
        container.innerHTML = component.template();
    }
}

class ChangeDetector {
    constructor(application) {
        this.application = application;
        this.zone = application.zone;
        this.renderer = application.renderer;
    }

    // Detect changes in the components in the application
    detectChanges() {
        this.zone.tasks.forEach(task => {
            if (task.name === "ngDoCheck") {
                task.task();
                this.renderer.render(task.component);
            }
        });
    }
}

export class BaseComponent {
    constructor(name) {
        this.name = name;
        this.template = () => ``;
    }

    // A method that will be called when the component is initialized
    ngOnInit() {
        console.log(`Initializing component: ${this.name}`);
    }

    // A method that will be called by the ChangeDetector to check for changes in the component
    ngDoCheck() {
        console.log(`Checking for changes in component: ${this.name}`);
    }
}

export class Application {
    constructor() {
        this.zone = new Zone();
        this.renderer = new Renderer();
        this.changeDetector = new ChangeDetector(this);

        setTimeoutPatch(() => {
            this.changeDetector.detectChanges();
        })
    }

    // Create a new component and add it to the zone
    createComponent(component) {
        this.zone.add({ component, task: () => component.ngOnInit(), name: "ngOnInit" });
        this.zone.add({ component, task: () => component.ngDoCheck(), name: "ngDoCheck" });
        return component;
    }

    // Initialize the components in the zone, render their templates, and detect changes
    run(component) {
        this.zone.run();
        this.renderer.render(component);
        this.changeDetector.detectChanges();
    }

    // Run the detectChanges method of the ChangeDetector at regular intervals
    tick() {
        setTimeout(() => { })
    }
}