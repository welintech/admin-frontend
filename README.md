# Admin Frontend

A modern web application built with React.js, featuring role-based access control, real-time notifications, and responsive design.

## Features

- Role-based authentication (Admin, Vendor, User)
- Real-time notifications using Socket.io
- Responsive dashboard layouts
- Modern UI with Tailwind CSS and Styled Components
- Data fetching with React Query
- Toast notifications with React Toastify

## Tech Stack

- React.js
- React Router
- Styled Components
- Tailwind CSS
- React Query
- React Toastify
- Socket.io Client

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd admin-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── hooks/          # Custom React hooks
  ├── pages/          # Page components
  ├── services/       # API and socket services
  ├── utils/          # Utility functions
  ├── App.js          # Main application component
  └── index.js        # Application entry point
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
