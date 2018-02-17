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
const events_1 = require("events");
const tweet_1 = require("./tweet");
class TimelineWatcher extends events_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
    }
}
exports.TimelineWatcher = TimelineWatcher;
class StreamWatcher extends TimelineWatcher {
    constructor({ client, path, params }) {
        super(client);
        this.path = path;
        this.params = params;
    }
    start() {
        this.stream = this.client.stream(this.path, this.params);
        this.listener = raw => {
            const tweet = new tweet_1.Tweet(raw);
            this.emit('tweet', tweet);
        };
        this.stream.on('data', this.listener);
    }
    stop() {
        this.stream.removeListener('data', this.listener);
    }
}
exports.StreamWatcher = StreamWatcher;
class RESTWatcher extends TimelineWatcher {
    constructor({ client, path, params, delay }) {
        super(client);
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
                this.timer = setInterval(() => {
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
                    this.emit('tweet', tweet);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    stop() {
        clearInterval(this.timer);
    }
}
exports.RESTWatcher = RESTWatcher;
//# sourceMappingURL=timeline-watcher.js.map