# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# Copy the built files from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html
# Expose port 80 for Nginx
EXPOSE 80
# Nginx is started by default when the container runs
CMD ["nginx", "-g", "daemon off;"]