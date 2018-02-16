"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_1 = require("./tweet");
const client_user_1 = require("./client-user");
class AbstractTimelineWatcher extends client_user_1.ClientUser {
    constructor(client, handler) {
        super(client);
        this.handler = handler;
    }
    onNewTweet(tweet) {
        this.handler.handle(tweet);
    }
}
exports.AbstractTimelineWatcher = AbstractTimelineWatcher;
class StreamWatcher extends AbstractTimelineWatcher {
    constructor({ client, handler, path, params }) {
        super(client, handler);
        this.path = path;
        this.params = params;
    }
    start() {
        const stream = this.client.stream(this.path, this.params);
        stream.on('data', raw => {
            const tweet = new tweet_1.Tweet(raw);
            this.onNewTweet(tweet);
        });
        stream.on('error', error => {
            console.error(error);
        });
    }
}
exports.StreamWatcher = StreamWatcher;
class RESTWatcher extends AbstractTimelineWatcher {
    constructor({ client, handler, path, params, delay }) {
        super(client, handler);
        this.path = path;
        this.params = params;
        this.delay = delay;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const raws = yield this.client.get(this.path, this.params);
                const tweet = new tweet_1.Tweet(raws[0]);
                this.lastTweet = tweet;
                setInterval(() => {
                    this.load();
                }, this.delay);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const raws = yield this.client.get(this.path, this.params);
                raws.reverse();
                for (const raw of raws) {
                    const tweet = new tweet_1.Tweet(raw);
                    if (tweet.compareTo(this.lastTweet) <= 0)
                        continue;
                    this.lastTweet = tweet;
                    this.onNewTweet(tweet);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.RESTWatcher = RESTWatcher;
//# sourceMappingURL=timeline-watcher.js.map