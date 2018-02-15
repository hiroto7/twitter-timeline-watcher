import * as Twitter from 'twitter';
import {Tweet} from './tweet';
import {ClientUser} from './client-user';
import {TweetHandler} from './tweet-handler';

export interface TimelineWatcher {
  handler: TweetHandler;

  start(): void;
  onNewTweet(tweet: Tweet): void;
}

export abstract class AbstractTimelineWatcher extends ClientUser implements TimelineWatcher {
  client: Twitter;
  handler: TweetHandler;

  constructor(client: Twitter, handler: TweetHandler) {
    super(client);
    this.handler = handler;
  }

  abstract start(): void;
  
  onNewTweet(tweet: Tweet): void {
    this.handler.handle(tweet);
  }
}

export class StreamWatcher extends AbstractTimelineWatcher {
  client: Twitter;
  handler: TweetHandler;
  path: string;
  params: string;

  constructor({client, handler, path, params}: {client: Twitter, handler: TweetHandler, path: string, params?: any}) {
    super(client, handler);
    this.path = path;
    this.params = params;
  }

  start(): void {
    const stream = this.client.stream(this.path, this.params);
    stream.on('data', raw => {
      const tweet: Tweet = new Tweet(raw);
      this.onNewTweet(tweet);
    });
    stream.on('error', error => {
      console.error(error);
    });
  }
}

export class RESTWatcher extends AbstractTimelineWatcher {
  client: Twitter;
  handler: TweetHandler;
  path: string;
  params: any;
  delay: number;
  private lastTweet: Tweet;

  constructor({
    client, handler, path, params, delay
  }: {
    client: Twitter, handler: TweetHandler, path: string, params?: any, delay: number
  }) {
    super(client, handler);
    this.path = path;
    this.params = params;
    this.delay = delay;
  }

  async start(): Promise<void> {
    try {
      const raws: any[] = await this.client.get(this.path, this.params);
      const tweet: Tweet = new Tweet(raws[0]);
      this.lastTweet = tweet;
      setInterval(() => {
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
        this.onNewTweet(tweet);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
