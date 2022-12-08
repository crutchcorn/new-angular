import { Zone } from './new-zonejs/index.js';

class Renderer {
    // Render the template of a component
    render(component) {
        const container = document.getElementById("root");
        const template = component.template();
        const matchingEl = Array.from(container.children).find(child => child.nodeName === template.nodeName);
        if (matchingEl) {
            matchingEl.replaceWith(template);
            return;
        }
        container.appendChild(template);
    }
}

class ChangeDetector {
    constructor(zone, renderer) {
        this.zone = zone;
        this.renderer = renderer;
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
        this.template = () => compileToFunction(this.templateStr, this);
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
        this.changeDetector = new ChangeDetector(this.zone, this.renderer);
        this.zone.add({ task: () => this.tick() });
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
        this.changeDetector.detectChanges();
    }
}

// This has a LOT of limitations, namely that it's bad
// It only handles one element + child text
// It only handles (eventName)="$1" and $1 is a templateArgs function syntax
function compileToFunction(templateStr, templateArgs) {
    const matchTemplateArgs = str => {
        if (str[0] === '$') {
            const key = str.slice(1);
            return templateArgs[key];
        }
        return str;
    }

    const openingTagStartIndex = templateStr.indexOf("<");
    const openingTagEndIndex = templateStr.indexOf(">", openingTagStartIndex);
    const openingTagStr = templateStr.slice(openingTagStartIndex, openingTagEndIndex + 1);

    const [_, elName] = /^<([a-z0-9]+)/.exec(openingTagStr);
    // [{name: "click", value: "$1"}]
    const events = [];

    const eventMatches = openingTagStr.matchAll(/\(([a-z]+)\)="(.*?)"/g);

    for (const match of eventMatches) {
        events.push({ name: match[1], value: matchTemplateArgs(match[2]) });
    }

    const closingTagStartIndex = templateStr.indexOf(`</${elName}>`, openingTagEndIndex);
    const textBetweenTags = matchTemplateArgs(templateStr.slice(openingTagEndIndex + 1, closingTagStartIndex));

    const el = document.createElement(elName);

    for (const { name, value } of events) {
        el.addEventListener(name, value);
    }

    el.innerHTML = textBetweenTags;

    return el;
}
