import * as Twitter from 'twitter';
import { EventEmitter } from 'events';
import { Tweet } from './tweet';
import { TimelineGetter } from './timeline-getter';

export abstract class TimelineWatcher extends EventEmitter { }

export abstract class WatcherStarter extends TimelineWatcher {
  helper: StartableWatcher;

  constructor(helper) {
    super();
    this.helper = helper;
    this.helper.on('tweet', (tweet: Tweet): void => {
      this.emit('tweet', tweet);
    })
    this.helper.start();
  }
}

export abstract class StartableWatcher extends TimelineWatcher {
  abstract start(): void;
  abstract stop(): void;
}

export class StreamWatcher extends WatcherStarter {
  constructor({ client, path, params }: { client: Twitter, path: string, params?: any }) {
    const helper = new StreamWatcherHelper({ client, path, params });
    super(helper);
  }
}

export class StreamWatcherHelper extends StartableWatcher {
  client: Twitter;
  path: string;
  params?: any;
  private stream: EventEmitter;
  private listener: (...args: any[]) => void;

  constructor({ client, path, params }: { client: Twitter, path: string, params?: any }) {
    super();
    this.client = client;
    this.path = path;
    this.params = params;
  }

  start(): void {
    this.stream = this.client.stream(this.path, this.params);
    this.listener = (raw: any): void => {
      const tweet = new Tweet(raw);
      this.emit('tweet', tweet);
    };
    this.stream.on('data', this.listener);
  }

  stop(): void {
    this.stream.removeListener('data', this.listener);
  }
}

export class RESTWatcher extends WatcherStarter {
  constructor({ client, path, params, delay }: { client: Twitter, path: string, params?: any, delay: number }) {
    const helper = new RESTWatcherHelper({ client, path, params, delay });
    super(helper);
  }
}

class RESTWatcherHelper extends StartableWatcher {
  delay: number;
  private getter: TimelineGetter;
  private lastTweet: Tweet;
  private timer: NodeJS.Timer;

  constructor({ client, path, params, delay }: { client: Twitter, path: string, params?: any, delay: number }) {
    super();
    this.delay = delay;
    this.getter = new TimelineGetter({ client, path, params });
  }

  async start(): Promise<void> {
    try {
      const tweets: Tweet[] = await this.getter.get();
      this.lastTweet = tweets[0];
      this.timer = setInterval(() => {
        this.load();
      }, this.delay);
    } catch (error) {
      console.error(error);
    }
  }

  private async load(): Promise<void> {
    try {
      const tweets: Tweet[] = await this.getter.get();
      tweets.reverse();
      for (const tweet of tweets) {
        if (tweet.compareTo(this.lastTweet) <= 0) continue;
        this.lastTweet = tweet;
        this.emit('tweet', tweet);
      }
    } catch (error) {
      console.error(error);
    }
  }

  stop(): void {
    clearInterval(this.timer);
  }
}
