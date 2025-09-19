# EyeCare Backend API

A Node.js backend application built with Express.js, MongoDB, and following MVC architecture with Repository pattern.

src/
├── config/ # Configuration files
│ ├── constants.js # Application constants
│ ├── database.js # Database connection
│ └── multer.js # File upload configuration
├── controllers/ # Route controllers
├── enums/ # Enumerations
├── middlewares/ # Express middlewares
├── models/ # MongoDB models
├── repositories/ # Database repositories
├── routes/ # Route definitions
├── services/ # Business logic services
├── utils/ # Utility classes
└── app.js # Main application entry point



## Features

- MVC architecture with Repository pattern
- JWT authentication (to be implemented)
- RESTful API design
- Error handling middleware
- Logging system
- File upload support
- Environment variable configuration
- Database migrations (via Mongoose)

## Prerequisites

- Node.js v16 or higher
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eyecare-backend.git
   cd eyecare-backend

2. Install dependencies:
npm install
# or
yarn install

3. Create a .env file in the root directory with the following variables:

PORT=3000
MONGO_URI=mongodb://localhost:27017/eyecare

