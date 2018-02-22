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
const timeline_getter_1 = require("./timeline-getter");
class TimelineWatcher extends events_1.EventEmitter {
}
exports.TimelineWatcher = TimelineWatcher;
class WatcherStarter extends TimelineWatcher {
    constructor(helper) {
        super();
        this.helper = helper;
        this.helper.on('tweet', (tweet) => {
            this.emit('tweet', tweet);
        });
        this.helper.start();
    }
}
exports.WatcherStarter = WatcherStarter;
class StartableWatcher extends TimelineWatcher {
}
exports.StartableWatcher = StartableWatcher;
class StreamWatcher extends WatcherStarter {
    constructor({ client, path, params }) {
        const helper = new StreamWatcherHelper({ client, path, params });
        super(helper);
    }
}
exports.StreamWatcher = StreamWatcher;
class StreamWatcherHelper extends StartableWatcher {
    constructor({ client, path, params }) {
        super();
        this.client = client;
        this.path = path;
        this.params = params;
    }
    start() {
        this.stream = this.client.stream(this.path, this.params);
        this.listener = (raw) => {
            const tweet = new tweet_1.Tweet(raw);
            this.emit('tweet', tweet);
        };
        this.stream.on('data', this.listener);
    }
    stop() {
        this.stream.removeListener('data', this.listener);
    }
}
exports.StreamWatcherHelper = StreamWatcherHelper;
class RESTWatcher extends WatcherStarter {
    constructor({ client, path, params, delay }) {
        const helper = new RESTWatcherHelper({ client, path, params, delay });
        super(helper);
    }
}
exports.RESTWatcher = RESTWatcher;
class RESTWatcherHelper extends StartableWatcher {
    constructor({ client, path, params, delay }) {
        super();
        this.delay = delay;
        this.getter = new timeline_getter_1.TimelineGetter({ client, path, params });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tweets = yield this.getter.get();
                this.lastTweet = tweets[0];
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
                const tweets = yield this.getter.get();
                tweets.reverse();
                for (const tweet of tweets) {
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
//# sourceMappingURL=timeline-watcher.js.map