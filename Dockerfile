FROM node:6.9.5

USER node
ENV NODE_HOME /home/node
ENV CLH_WEB_API_HOME ${NODE_HOME}/clh-web-api

RUN mkdir -p ${CLH_WEB_API_HOME}
WORKDIR ${CLH_WEB_API_HOME}
ADD npm-shrinkwrap.json ${CLH_WEB_API_HOME}/
RUN npm install
ADD package.json ${CLH_WEB_API_HOME}/
ADD app ${CLH_WEB_API_HOME}/app
ADD swagger ${CLH_WEB_API_HOME}/swagger
ADD bin ${CLH_WEB_API_HOME}/bin

EXPOSE 8087

CMD npm start