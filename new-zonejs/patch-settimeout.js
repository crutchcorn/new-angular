import {currentZone} from './index.js';

export const setTimeoutPatch = () => {
    const originalSetTimeout = setTimeout;

    setTimeout = (callback, delay, ...args) => {
        const context = this;

        return originalSetTimeout(() => {
            callback.apply(context, args);
            currentZone.run();
        }, delay);
    };
};