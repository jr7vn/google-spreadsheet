 # Create image based on the official Node 8 image from dockerhub
FROM node:12 as build-stage

# Create a directory where our app will be placed
RUN mkdir -p /app

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json /app/

# Install dependecies
RUN npm install

# Intall react-scripts global
RUN npm install -g react-scripts

COPY ./ /app/

# Build app
RUN npm run build

FROM nginx:1.15

COPY --from=build-stage /app/build/ /usr/share/nginx/html/

COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

