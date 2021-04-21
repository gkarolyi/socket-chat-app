# My very simple but super ultra fun chat app

This is just a little chat application I am building in order to get started on learning a bit of `node.js` with `express` and `socket.io`. This project is deployed [here](https://gkarolyi-simple-chat.herokuapp.com/).

### Project goals:

- [x] add proper support for nicknames - users can now set their nickname with the `/nick` command. If the user doesn't set a nickname, the server allocates one dynamically by searching for the first available handle. The naming pattern used is `anonymous#{number}`, and nicknames are reserved for ten minutes after a user exits the channel to avoid confusion.
- [x] messages should be inserted locally for the sender and not sent back via `socket`
- [ ] typing indicator
- [ ] choice of rooms with indicators of participants
- [x] private messages - users can send each other private messages twitter-style by tagging each other using the `@` symbol. Private messages can be sent to any number of users, and clicking on a highlighted handle copies it and focuses the input field to allow for easy messaging.
- [x] Tailwind CSS
