import * as Twitter from 'twitter';
import { Tweet } from './tweet';

export class TimelineGetter {
  client: Twitter;
  path: string;
  params: any;

  constructor({ client, path, params }: { client: Twitter, path: string, params?: any }) {
    this.client = client;
    this.path = path;
    this.params = params;
  }

  async get(): Promise<Tweet[]> {
    const raws: any[] = await this.client.get(this.path, this.params);
    const tweets: Tweet[] = new Array<Tweet>();
    for (const raw of raws) {
      const tweet: Tweet = new Tweet(raw);
      tweets.push(tweet);
    }
    return tweets;
  }
}