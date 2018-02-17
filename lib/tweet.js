"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const bignumber_js_1 = require("bignumber.js");
class JSONHolder {
    constructor(raw) {
        this.raw = raw;
    }
    toJSON() {
        return this.raw;
    }
}
class Tweet extends JSONHolder {
    constructor(raw) {
        super(raw);
        this.upgrade();
    }
    upgrade() {
        if (this.raw.user)
            this.user = new User(this.raw.user);
        if (this.raw.created_at)
            this.createdAt = new Date(this.raw.created_at);
        if (this.raw.source)
            this.source = new Source(this.raw.source);
        if (this.raw.quoted_status)
            this.quotedStatus = new Tweet(this.raw.quoted_status);
    }
    via(name) {
        if (!this.source)
            throw new Error();
        return this.source.name === name;
    }
    compareTo(tweet2) {
        if (!this.raw.id_str || !tweet2.raw.id_str)
            throw new Error();
        const id1 = new bignumber_js_1.BigNumber(this.raw.id_str);
        const id2 = new bignumber_js_1.BigNumber(tweet2.raw.id_str);
        return id1.comparedTo(id2);
    }
    toString() {
        if (!this.user || !this.user.raw.screen_name || !this.raw.text)
            return 'Invalid Tweet';
        return `@${this.user.raw.screen_name}: ${this.raw.text}`;
    }
}
exports.Tweet = Tweet;
class User extends JSONHolder {
    constructor(raw) {
        super(raw);
        this.upgrade();
    }
    upgrade() {
        if (this.status)
            this.status = new Tweet(this.raw.status);
        if (this.createdAt)
            this.createdAt = new Date(this.raw.created_at);
    }
}
exports.User = User;
class Source extends JSONHolder {
    constructor(raw) {
        super(raw);
        this.upgrade();
    }
    upgrade() {
        const re = /^<a href="(.*?)".*?>(.*?)<\/a>$/;
        const array = re.exec(this.raw);
        if (array === null)
            throw new Error();
        this.website = new url_1.URL(array[1]);
        this.name = array[2];
    }
}
//# sourceMappingURL=tweet.js.map