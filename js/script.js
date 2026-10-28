const welcomeScreen = document.getElementById('welcomeScreen');
const dashboard = document.getElementById('dashboard');
const roomForm = document.getElementById('roomForm');
const userNameInput = document.getElementById('userName');
const roomCodeInput = document.getElementById('roomCodeInput');
const entryMessage = document.getElementById('entryMessage');
const dashboardMessage = document.getElementById('dashboardMessage');
const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');
const itemQuantityInput = document.getElementById('itemQuantity');

let currentUser = '';
let currentRoomCode = '';
let currentRoom = null;
const ROOM_PREFIX = 'cartshare_room_';

function roomStorageKey(code) { return ROOM_PREFIX + code; }
function makeId() {
  return window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function money(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}
function getRoom(code) {
  try {
    const saved = localStorage.getItem(roomStorageKey(code));
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Could not read room data:', error);
    return null;
  }
}
function saveRoom() {
  localStorage.setItem(roomStorageKey(currentRoomCode), JSON.stringify(currentRoom));
  renderDashboard();
}
function addActivity(message, itemName = '') {
  currentRoom.activities.unshift({ id: makeId(), user: currentUser, message, itemName, time: new Date().toISOString() });
  currentRoom.activities = currentRoom.activities.slice(0, 60);
}
function createRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (getRoom(code));
  return code;
}
function enterRoom(code, room) {
  currentUser = userNameInput.value.trim();
  if (!currentUser) {
    entryMessage.textContent = 'Please enter your name first.';
    userNameInput.focus();
    return;
  }
  currentRoomCode = code;
  currentRoom = room;
  if (!currentRoom.members.includes(currentUser)) currentRoom.members.push(currentUser);
  addActivity('joined the room');
  saveRoom();
  document.getElementById('welcomeName').textContent = currentUser;
  welcomeScreen.classList.add('d-none');
  dashboard.classList.remove('d-none');
  entryMessage.textContent = '';
  dashboardMessage.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('createRoomBtn').addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if (!name) {
    entryMessage.textContent = 'Please enter your name before creating a room.';
    userNameInput.focus();
    return;
  }
  const code = createRoomCode();
  const room = { code, createdAt: new Date().toISOString(), items: [], activities: [], members: [] };
  userNameInput.value = name;
  enterRoom(code, room);
});

roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = userNameInput.value.trim();
  const code = roomCodeInput.value.trim().toUpperCase();
  if (!name) {
    entryMessage.textContent = 'Please enter your name first.';
    userNameInput.focus();
    return;
  }
  if (!code) {
    entryMessage.textContent = 'Enter a room code to join.';
    return;
  }
  const room = getRoom(code);
  if (!room) {
    entryMessage.textContent = 'Room not found in this browser. Create it first, or check the code.';
    return;
  }
  enterRoom(code, room);
});

itemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = itemNameInput.value.trim();
  const price = Number(itemPriceInput.value);
  const quantity = Number(itemQuantityInput.value);
  if (!name || itemPriceInput.value === '' || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    dashboardMessage.textContent = 'Enter an item name, a valid non-negative price, and a quantity from 1 to 999.';
    return;
  }
  currentRoom.items.push({ id: makeId(), name, price, quantity, addedBy: currentUser, addedAt: new Date().toISOString() });
  addActivity(`added ${quantity} × ${name}`, name);
  saveRoom();
  itemForm.reset();
  itemQuantityInput.value = '1';
  itemNameInput.focus();
  dashboardMessage.textContent = `${name} added to the shared cart.`;
});

document.getElementById('cartItems').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-id]');
  if (!button) return;
  const item = currentRoom.items.find((entry) => entry.id === button.dataset.removeId);
  if (!item) return;
  currentRoom.items = currentRoom.items.filter((entry) => entry.id !== item.id);
  addActivity(`removed ${item.name}`, item.name);
  saveRoom();
  dashboardMessage.textContent = `${item.name} removed from the cart.`;
});

function formatTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function renderDashboard() {
  if (!currentRoom) return;
  document.getElementById('roomCodeDisplay').textContent = currentRoomCode;
  document.getElementById('memberCount').textContent = `${currentRoom.members.length} participant${currentRoom.members.length === 1 ? '' : 's'}`;
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  cartItems.innerHTML = '';
  emptyCart.classList.toggle('d-none', currentRoom.items.length > 0);
  currentRoom.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    const info = document.createElement('div');
    const itemName = document.createElement('div');
    itemName.className = 'cart-item-name';
    itemName.textContent = item.name;
    const meta = document.createElement('div');
    meta.className = 'cart-item-meta';
    meta.textContent = `Qty ${item.quantity} · ${money(item.price)} each · added by ${item.addedBy}`;
    info.append(itemName, meta);
    const price = document.createElement('div');
    price.className = 'cart-item-price';
    price.textContent = money(item.price * item.quantity);
    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.type = 'button';
    remove.dataset.removeId = item.id;
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.title = 'Remove item';
    remove.textContent = '×';
    row.append(info, price, remove);
    cartItems.appendChild(row);
  });
  const quantityTotal = currentRoom.items.reduce((sum, item) => sum + item.quantity, 0);
  const amountTotal = currentRoom.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById('itemCount').textContent = `${quantityTotal} item${quantityTotal === 1 ? '' : 's'}`;
  document.getElementById('totalDetail').textContent = `${currentRoom.items.length} product type${currentRoom.items.length === 1 ? '' : 's'} in your cart`;
  document.getElementById('cartTotal').textContent = money(amountTotal);

  const activityList = document.getElementById('activityList');
  const emptyActivity = document.getElementById('emptyActivity');
  activityList.innerHTML = '';
  emptyActivity.classList.toggle('d-none', currentRoom.activities.length > 0);
  currentRoom.activities.slice(0, 12).forEach((activity) => {
    const row = document.createElement('div');
    row.className = 'activity-entry';
    const avatar = document.createElement('div');
    avatar.className = 'activity-avatar';
    avatar.textContent = (activity.user || '?').charAt(0).toUpperCase();
    const textWrap = document.createElement('div');
    const text = document.createElement('div');
    text.className = 'activity-text';
    const user = document.createElement('strong');
    user.textContent = activity.user;
    text.append(user, document.createTextNode(` ${activity.message}`));
    const time = document.createElement('span');
    time.className = 'activity-time';
    time.textContent = formatTime(activity.time);
    textWrap.append(text, time);
    row.append(avatar, textWrap);
    activityList.appendChild(row);
  });
}

document.getElementById('copyRoomBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentRoomCode);
    document.getElementById('copyRoomBtn').textContent = 'Copied!';
  } catch (error) {
    window.prompt('Copy this room code:', currentRoomCode);
  }
});

document.getElementById('leaveRoomBtn').addEventListener('click', () => {
  currentRoom = null;
  currentRoomCode = '';
  currentUser = '';
  dashboard.classList.add('d-none');
  welcomeScreen.classList.remove('d-none');
  userNameInput.value = '';
  roomCodeInput.value = '';
  entryMessage.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('printReceiptBtn').addEventListener('click', () => {
  if (!currentRoom) return;
  document.getElementById('receiptRoomCode').textContent = currentRoomCode;
  document.getElementById('receiptDate').textContent = new Date().toLocaleString();
  const rows = document.getElementById('receiptRows');
  rows.innerHTML = '';
  currentRoom.items.forEach((item) => {
    const tr = document.createElement('tr');
    [item.name, String(item.quantity), money(item.price), item.addedBy, money(item.price * item.quantity)].forEach((value, index) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (index === 4) td.className = 'text-end';
      tr.appendChild(td);
    });
    rows.appendChild(tr);
  });
  const total = currentRoom.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById('receiptTotal').textContent = money(total);
  window.print();
});

// The storage event fires in OTHER tabs on the same browser origin.
window.addEventListener('storage', (event) => {
  if (!currentRoomCode || event.key !== roomStorageKey(currentRoomCode)) return;
  if (!event.newValue) {
    dashboardMessage.textContent = 'This room data was removed from browser storage.';
    return;
  }
  try {
    currentRoom = JSON.parse(event.newValue);
    renderDashboard();
    dashboardMessage.textContent = 'Room updated from another browser tab.';
  } catch (error) {
    console.error('Could not sync room data:', error);
  }
});
