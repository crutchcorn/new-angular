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
        this.tasks.forEach(task => task.task());
    }
}

export {Zone};