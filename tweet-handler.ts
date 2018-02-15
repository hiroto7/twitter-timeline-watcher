import * as Twitter from 'twitter';
import {Tweet} from './tweet';
import {ClientUser} from './client-user';

export interface TweetHandler {
  handle(tweet: Tweet): void;
}

export abstract class AbstractTweetHandler extends ClientUser implements TweetHandler {
  client: Twitter;

  abstract handle(tweet: Tweet): void;

  constructor(client: Twitter) {
    super(client);
  }
}
