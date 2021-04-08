FROM nikolaik/python-nodejs:latest

WORKDIR /usr/src/app

COPY package*.json ./  


RUN npm install -g npm@latest && npm install && npm audit fix
RUN python -m pip install -U pip

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start"]
