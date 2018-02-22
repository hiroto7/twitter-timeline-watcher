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
class TimelineGetter {
    constructor({ client, path, params }) {
        this.client = client;
        this.path = path;
        this.params = params;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const raws = yield this.client.get(this.path, this.params);
            const tweets = new Array();
            for (const raw of raws) {
                const tweet = new tweet_1.Tweet(raw);
                tweets.push(tweet);
            }
            return tweets;
        });
    }
}
exports.TimelineGetter = TimelineGetter;
//# sourceMappingURL=timeline-getter.js.map