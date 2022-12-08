import {currentZone} from "./index.js";

export const addEventListenerPatch = () => {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        const context = this;
        const originalListener = listener;

        const patchedListener = function (event) {
            originalListener.apply(context, [event]);
            currentZone.run();
        };

        return originalAddEventListener.call(this, type, patchedListener, options);
    }
}
