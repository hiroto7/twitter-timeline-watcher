"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = require("twitter");
const index_1 = require("./index");
const keys = require("./keys.json");
class Test {
    constructor(watcher) {
        this.watcher = watcher;
        this.count = 0;
    }
    handle(tweet) {
        console.log(`[${this.count}]`);
        console.log(tweet.toString());
        if (tweet.source)
            console.log(tweet.source.name);
        if (tweet.createdAt)
            console.log(tweet.createdAt.toLocaleString());
        this.count++;
    }
    start() {
        this.watcher.on('tweet', (tweet) => {
            this.handle(tweet);
        });
    }
}
const client = new Twitter(keys);
const watchers = [
    new index_1.StreamWatcher({ client, path: 'user' }),
    new index_1.RESTWatcher({
        client: client,
        path: 'statuses/home_timeline',
        params: { count: 50 },
        delay: 1000 * 60
    })
];
new Test(watchers[0]).start();
// new Test(watchers[1]).start();
//# sourceMappingURL=test.js.map