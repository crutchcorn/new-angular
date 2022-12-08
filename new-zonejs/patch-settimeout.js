export const setTimeoutPatch = (fn) => {
    const originalSetTimeout = setTimeout;

    setTimeout = (callback, delay, ...args) => {
        const context = this;

        return originalSetTimeout(() => {
            callback.apply(context, args);
            fn();
        }, delay);
    };
};