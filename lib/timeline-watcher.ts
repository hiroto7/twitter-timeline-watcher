import * as Twitter from 'twitter';
import {EventEmitter} from 'events';
import {Tweet} from './tweet'

export abstract class TimelineWatcher extends EventEmitter {
  client: Twitter;

  constructor(client: Twitter) {
    super();
    this.client = client;
  }

  abstract start(): void;
  abstract stop(): void;
}

export class StreamWatcher extends TimelineWatcher {
  path: string;
  params?: any;
  private stream: EventEmitter;
  private listener: (...args: any[]) => void;

  constructor({client, path, params}: {client: Twitter, path: string, params?: any}) {
    super(client);
    this.path = path;
    this.params = params;
  }

  start(): void {
    this.stream = this.client.stream(this.path, this.params);
    this.listener = raw => {
      const tweet = new Tweet(raw);
      this.emit('tweet', tweet);
    };
    this.stream.on('data', this.listener);
  }

  stop(): void {
    this.stream.removeListener('data', this.listener);
  }
}

export class RESTWatcher extends TimelineWatcher {
  path: string;
  params?: any;
  delay: number;
  private lastTweet: Tweet;
  private timer: NodeJS.Timer;

  constructor({client, path, params, delay}: {client: Twitter, path: string, params?: any, delay: number}) {
    super(client);
    this.path = path;
    this.params = params;
    this.delay = delay;
  }

  async start(): Promise<void> {
    try {
      const raws: any[] = await this.client.get(this.path, this.params);
      const tweet: Tweet = new Tweet(raws[0]);
      this.lastTweet = tweet;
      this.timer = setInterval(() => {
        this.load();
      }, this.delay);
    } catch (error) {
      console.error(error);
    }
  }

  private async load(): Promise<void> {
    try {
      const raws: any[] = await this.client.get(this.path, this.params);
      raws.reverse();
      for (const raw of raws) {
        const tweet: Tweet = new Tweet(raw);
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
