FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port 5501
EXPOSE 5501

# Run the app
CMD [ "npm", "run", "dev" ]
