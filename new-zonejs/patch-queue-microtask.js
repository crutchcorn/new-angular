import {currentZone} from "./index.js";

export const queueMicrotaskPatch = () => {
    const originalQueueMicrotask = queueMicrotask;

    queueMicrotask = (callback) => {
        const context = this;

        return originalQueueMicrotask(() => {
            callback.apply(context);
            currentZone.run();
        });
    };
};
