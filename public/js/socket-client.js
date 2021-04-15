const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const socket = io();
socket.nick = "anonymous";

const createListItem = ({ heading, time, text, classList, type }) => {
  return `
         <li class="p-3 ${classList || ""}">
          <div class="flex space-x-3">
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="heading text-sm ${
                  type == "announcement" ? "font-medium" : "font-bold"
                }">${heading}</h3>
                <p class="time text-sm text-gray-700">${time}</p>
              </div>
              <p class="message text-sm text-gray-900">
                ${text}
              </p>
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
  message.time = timeNow();
  const item = createListItem(message);
  messages.insertAdjacentHTML("beforeend", item);
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
  socket.emit("nick change", {
    oldNick: socket.nick,
    newNick,
  });
  socket.nick = newNick;
};

const emitMessage = () => {
  socket.emit("chat message", {
    sender: socket.id,
    nick: socket.nick,
    text: input.value,
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value) return;

  input.value.startsWith("/nick") ? setNick() : emitMessage();
  input.value = "";
});

// focus input on load and keep it focused
input.focus();
input.addEventListener("blur", (event) => {
  input.focus();
});

socket.on("chat message", (message) => {
  var classList = null;
  if (message.sender == socket.id) {
    message.nick += " (you)";
    classList = "bg-blue-50";
  }
  addMessage({
    heading: message.nick,
    text: message.text,
    classList,
  });
});

socket.on("announcement", (announcement) => {
  addMessage({
    heading: announcement.heading,
    text: announcement.text,
    classList: announcement.classList || null,
    type: "announcement",
  });
});
