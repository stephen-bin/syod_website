# The Spiritual Youth on a Date (Official Website)

Landing page for the book *The Spiritual Youth on a Date* by Stephen Npoandan Binaansim.

## Features

- **Modern Landing Page**: Responsive design, animations, and "The Modern Apostle" branding.
- **Shopping Cart**: Add books to cart, persistence via LocalStorage.
- **WhatsApp Checkout**: Order directly via WhatsApp with a pre-filled message (fully static).
- **Paystack Integration**:
  - **Dynamic Backend**: Calculated totals and secure initialization (requires Node.js server).
  - **Static Fallback**: Direct link to Paystack Payment Page (for GitHub Pages).
- **Event Registration**: Register for events (Backend: Email + Database / Static: WhatsApp redirect).

## Setup & Deployment

### 1. Static Hosting (GitHub Pages / Netlify)

This is the **recommended** way to host the frontend for free.

- **Limitations**: The "Pay Online" button will redirect to a fixed payment page, and Event Registration will redirect to WhatsApp. The backend API is not available.
- **How to Deploy**:
    1. Push this code to a GitHub repository.
    2. Go to Settings -> Pages -> Select `main` branch.

### 2. Full Stack (Node.js)

To enable dynamic payments, order savings, and automated emails:

- **Install**: `npm install`
- **Configure**: Create `.env`:

    ```env
    PAYSTACK_SECRET_KEY=sk_test_...
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    PORT=3000
    ```

- **Run**: `npm start`
- **Deploy**: Use a service like **Render** or **Heroku** that supports Node.js.

## Project Structure

- `index.html`: Main entry point.
- `css/style.css`: All styling (Vanilla CSS).
- `js/`: Application logic (`app.js`, `cart.js`, `payment.js`, `events.js`).
- `server.js`: Node.js backend (optional).
- `data/`: JSON storage for orders/events (backend only).
