import * as Twitter from 'twitter';
import {Tweet} from './tweet';
import {TimelineWatcher, AbstractTimelineWatcher, StreamWatcher, RESTWatcher} from './timeline-watcher';
import {TweetHandler, AbstractTweetHandler} from './tweet-handler';
import * as keys from './keys.json';

export class TweetHandlerTest extends AbstractTweetHandler {
  client: Twitter;
  private count: number = 0;

  handle(tweet: Tweet): void {
    console.log(`[${this.count}] ${'-'.repeat(100)}`);
    console.log(tweet.toString());
    console.log(tweet.createdAt);
    // console.log(tweet);
    this.count++;
  }
}

const client: Twitter = new Twitter(keys);
const handler: TweetHandler = new TweetHandlerTest(client);

//*
const watcher: TimelineWatcher = new StreamWatcher({client, handler, path: 'user'});
/*/
const watcher: TimelineWatcher = new RESTWatcher({client, handler, path: 'statuses/home_timeline', params: {
  count: 50
}, delay: 1000 * 60});
//*/

watcher.start();