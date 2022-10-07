export default class Ratelimit {
    /**
     * @description Self-initialising ratelimit map and clearing the map every 5 minutes
     * @param timeToClear The time in milliseconds to clear the ratelimit map
     */
    constructor(timeToClear: number = 60000) {
        this.ratelimit = new Map();

        setInterval(() => {
            this.ratelimit.forEach((value, key) => {
                if (value <= Date.now()) {
                    this.ratelimit.delete(key);
                }
            });
        }, timeToClear);
    };

    private ratelimit: Map<string, number> = new Map();

    /**
     * @description Adds a user to the ratelimit map with the current time.
     * @param {string} id The IP of the user 
     */
    public add(id: string) {
        this.ratelimit.set(id, Date.now());
    };

    /**
     * @description Checks if a user is in the ratelimit map.
     * @param id The IP of the user
     * @returns 
     */
    public check(id: string) {
        if (this.ratelimit.has(id)) {
            return true;
        };
        this.add(id);
        return true;
    };

    /**
     * @description Delete the user from the database
     * @param id The IP of the user
     */
    public delete(id: string) {
        this.ratelimit.delete(id);
    };

    /**
     * @description Clear the ratelimit map of all users
     */
    public clear() {
        this.ratelimit.clear();
    };
};