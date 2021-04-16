const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const socket = io();

const highlightUserNicks = (text) => {
  return text.replace(
    /@\w+/gm,
    `
  <a href="" class="p-1 bg-blue-400 text-white italic rounded-md username">$&</a>`
  );
};

const copyNickToInput = (event) => {
  event.preventDefault();
  if (!input.value.includes(event.target.text)) {
    const text =
      input.value.slice(-1) == " "
        ? event.target.text
        : ` ${event.target.text}`;
    input.value += `${event.target.text} `;
  }
  input.focus();
};

const createListItem = ({
  heading,
  nick,
  time,
  text,
  classList,
  type,
  senderId,
  private,
}) => {
  const headingFontWeight =
    type == "announcement" ? "font-medium" : "font-bold";
  const recipients = private ? "private message" : "to everyone";
  const headingText = heading || nick;
  return `
         <li class="p-3 ${classList || ""}">
          <div class="flex space-x-3">
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <h3 data-sender-id=${senderId} class="heading text-m ${headingFontWeight}">${headingText}</h3>
                <p class="time text-sm text-gray-700">${time}</p>
              </div>
              <p class="message text-m text-gray-900">
                ${highlightUserNicks(text)}
              </p>
              <p class="recipients text-xs italic font-light">${recipients}</p>
            </div>
          </div>
        </li>
        `;
};

const timeNow = () => {
  const today = new Date();
  return `${today.getHours()}:${today.getMinutes()}`;
};

const addMessage = (message) => {
  console.log(message);
  var classList = null;
  if (message.senderId == socket.id) {
    message.nick = `${socket.username} (you)`;
    message.classList = "bg-blue-50";
  }
  message.time = timeNow();
  const item = createListItem(message);
  messages.insertAdjacentHTML("beforeend", item);
  var highlightedNick = messages.lastElementChild.querySelector(".username");
  if (highlightedNick) {
    highlightedNick.addEventListener("click", copyNickToInput);
  }
  window.scrollTo(0, document.body.scrollHeight);
};

const setNick = () => {
  var newNick = input.value.split(" ");
  newNick =
    newNick.length > 1
      ? newNick[1]
      : prompt(
          "Oops, you forgot to provide a nickname! Set one below:",
          "anonymous"
        );
  socket.emit("newNick", socket.id, newNick);
};

const emitMessage = () => {
  const message = {
    senderId: socket.id,
    text: input.value,
  };
  const recipients = input.value.match(/@\w+/gm);
  if (recipients) {
    (message.private = true), (message.recipients = recipients);
  }
  socket.emit("chatMessage", message);
  addMessage(message);
};

const commands = {
  "/help": socket.emit("help"),
  "/online": socket.emit("online"),
};

const commandHandler = () => {};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value) return;
  // emit msg with recipients obj
  // recipients should contain ids
  input.value.startsWith("/nick") ? setNick() : emitMessage();
  input.value = "";
});

// focus input on load and keep it focused
input.focus();
/* input.addEventListener("blur", (event) => {
  input.focus();
}); */

socket.on("chatMessage", (message) => {
  addMessage(message);
});

socket.on("announcement", (announcement) => {
  addMessage({
    heading: announcement.heading,
    text: announcement.text,
    classList: announcement.classList || null,
    type: "announcement",
    private: false,
    senderId: "announcement",
  });
});

socket.on("newNick", (username) => {
  socket.username = username;
});
