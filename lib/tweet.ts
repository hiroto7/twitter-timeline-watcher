import {URL} from 'url';
import {BigNumber} from 'bignumber.js';

class JSONHolder {
  raw: any;

  constructor(raw: any) {
    this.raw = raw;
  }

  toJSON() {
    return this.raw;
  }
}

export class Tweet extends JSONHolder {
  raw: any;
  user?: User;
  createdAt?: Date;
  source?: Source;
  quotedStatus?: Tweet;

  constructor(raw: any) {
    super(raw);
    this.upgrade();
  }

  private upgrade(): void {
    if (this.raw.user) this.user = new User(this.raw.user);
    if (this.raw.created_at) this.createdAt = new Date(this.raw.created_at);
    if (this.raw.source) this.source = new Source(this.raw.source);
    if (this.raw.quoted_status) this.quotedStatus = new Tweet(this.raw.quoted_status);
  }

  via(name: string): boolean {
    if (!this.source) throw new Error();
    return this.source.name === name;
  }

  compareTo(tweet2: Tweet): number {
    if (!this.raw.id_str || !tweet2.raw.id_str) throw new Error();
    const id1: BigNumber = new BigNumber(this.raw.id_str);
    const id2: BigNumber = new BigNumber(tweet2.raw.id_str);
    return id1.comparedTo(id2);
  }

  toString(): string {
    if (!this.user || !this.user.raw.screen_name || !this.raw.text) return 'Invalid Tweet';
    return `@${this.user.raw.screen_name}: ${this.raw.text}`;
  }
}

export class User extends JSONHolder {
  raw: any;
  status?: Tweet;
  createdAt?: Date;
  
  constructor(raw: any) {
    super(raw);
    this.upgrade();
  }

  private upgrade(): void {
    if (this.status) this.status = new Tweet(this.raw.status);
    if (this.createdAt) this.createdAt = new Date(this.raw.created_at);
  }
}

class Source extends JSONHolder {
  raw: string;
  name: string;
  website: URL;

  constructor(raw: string) {
    super(raw);
    this.upgrade();
  }

  private upgrade(): void {
    const re: RegExp = /^<a href="(.*?)".*?>(.*?)<\/a>$/;
    const array: string[] | null = re.exec(this.raw);
    if (array === null) throw new Error();
    this.website = new URL(array[1]);
    this.name = array[2];
  }
}
