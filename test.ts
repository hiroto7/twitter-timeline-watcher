import * as Twitter from 'twitter';
import {Tweet} from './index';
import {TimelineWatcher, StreamWatcher, RESTWatcher} from './index';
import * as keys from './keys.json';

class Test {
  watcher: TimelineWatcher;
  count: number;

  constructor(watcher: TimelineWatcher) {
    this.watcher = watcher;
    this.count = 0;
  }

  private handle(tweet: Tweet) {
    const header = `[${this.count}]`;
    const line = '-'.repeat(process.stdout.columns - header.length - 1);
    console.log(`${header} ${line}`);
    console.log(tweet.toString());
    if (tweet.source) console.log(tweet.source.name);
    if (tweet.createdAt) console.log(tweet.createdAt.toLocaleString());
    this.count++;
  }

  start() {
    this.watcher.on('tweet', (tweet: Tweet) => {
      this.handle(tweet);
    });
    this.watcher.start();
  }
}

const client: Twitter = new Twitter(keys);
const watchers: TimelineWatcher[] = [
  new StreamWatcher({client, path: 'user'}),
  new RESTWatcher({
    client: client,
    path: 'statuses/home_timeline',
    params: {count: 50},
    delay: 1000 * 60
  })
];

new Test(watchers[0]).start();
// new Test(watchers[1]).start();
