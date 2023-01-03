FROM node:alpine
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm run release
WORKDIR /src
ENTRYPOINT [ "node", "/usr/src/app/bin/index.js" ]
CMD "--help"
