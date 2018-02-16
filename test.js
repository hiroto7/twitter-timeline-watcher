"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = require("twitter");
const index_1 = require("./index");
const index_2 = require("./index");
const keys = require("./keys.json");
class TweetHandlerTest extends index_2.AbstractTweetHandler {
    constructor() {
        super(...arguments);
        this.count = 0;
    }
    handle(tweet) {
        console.log(`[${this.count}] ${'-'.repeat(100)}`);
        console.log(tweet.toString());
        console.log(tweet.createdAt);
        // console.log(tweet);
        this.count++;
    }
}
const client = new Twitter(keys);
const handler = new TweetHandlerTest(client);
//*
const watcher = new index_1.StreamWatcher({ client, handler, path: 'user' });
/*/
const watcher: TimelineWatcher = new RESTWatcher({client, handler, path: 'statuses/home_timeline', params: {
  count: 50
}, delay: 1000 * 60});
//*/
watcher.start();
//# sourceMappingURL=test.js.map