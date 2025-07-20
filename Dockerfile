FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the React app (optional if using dev server)
RUN npm run build

# Expose port and run dev server
EXPOSE 3000
CMD ["npm", "start"]
