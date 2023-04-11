FROM node:alpine
WORKDIR /usr/src/openapi
COPY . /usr/src/openapi
RUN npm install
RUN npm run release
ENTRYPOINT [ "node", "/usr/src/openapi/bin/index.js" ]
CMD "--help"
