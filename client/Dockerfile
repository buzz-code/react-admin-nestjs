FROM node:16

WORKDIR /usr/src/app

RUN ls

COPY package.json ./ 
COPY yarn.lock ./ 

RUN ls

RUN yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
