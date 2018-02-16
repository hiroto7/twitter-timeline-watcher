"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = require("twitter");
const timeline_watcher_1 = require("./timeline-watcher");
const tweet_handler_1 = require("./tweet-handler");
const keys = require("./keys.json");
class TweetHandlerTest extends tweet_handler_1.AbstractTweetHandler {
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
const watcher = new timeline_watcher_1.StreamWatcher({ client, handler, path: 'user' });
/*/
const watcher: TimelineWatcher = new RESTWatcher({client, handler, path: 'statuses/home_timeline', params: {
  count: 50
}, delay: 1000 * 60});
//*/
watcher.start();
//# sourceMappingURL=test.js.map