# CartShare

CartShare is a responsive collaborative shopping-cart demo built with HTML, CSS, Bootstrap, and vanilla JavaScript.

## Features
- Create a room with a unique six-character code or join a room by code.
- Add and remove shopping items, quantities, and prices.
- See the estimated total and who added each item.
- View an activity log for room actions.
- Persist room data with `localStorage`.
- Synchronize updates between tabs using the browser `storage` event.
- Generate a clean, printable receipt.
- Responsive layout for desktop and mobile screens.

## Run locally
1. Download or clone this repository.
2. Open the `CartShare` folder in Visual Studio Code.
3. Open `index.html` in a browser. For a smoother development experience, you can use the VS Code Live Server extension.
4. Enter a name and select **Create a new room**.
5. Open the same deployed/local origin in a second browser tab, enter a different name, and join with the room code.

## Project structure
```text
CartShare/
├── index.html
├── README.md
├── css/style.css
├── js/script.js
└── assets/images/
```

## Important limitation
This starter version uses browser `localStorage`. It synchronizes tabs that use the same browser profile and website origin, but it does not synchronize data between different devices, separate browser profiles, or different browsers. A production multi-device version needs a shared backend such as Firebase or Supabase, with suitable access controls.

## Deployment
You can publish the static files with Netlify, Vercel, or GitHub Pages. Keep the folder structure intact and publish the folder containing `index.html`.
