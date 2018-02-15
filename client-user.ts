import * as Twitter from 'twitter';

export class ClientUser {
  client: Twitter;

  constructor(client: Twitter) {
    this.client = client;
  }
}
