FROM node:4.4.3

RUN mkdir /clhApp
WORKDIR /clhApp
ADD package.json /clhApp/package.json
RUN npm install --unsafe-perm
ADD . /clhApp

EXPOSE 8087

CMD npm start --unsafe-perm