FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install react-hook-form@7.48.2 --save

# Copy project files
COPY . .

# Start the app in development mode
CMD ["npm", "start"] 