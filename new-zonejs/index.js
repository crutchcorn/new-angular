class Zone {
    constructor() {
        this.tasks = [];
    }

    // Add a new task to the zone
    add(task) {
        this.tasks.push(task);
    }

    // Run all the tasks in the zone
    run() {
        currentZone = this;
        this.tasks.forEach(task => task.task());
    }
}

var currentZone = new Zone();

export {Zone, currentZone};