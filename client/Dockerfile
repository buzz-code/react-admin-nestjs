FROM node:14.16.1

WORKDIR /app

RUN ls

COPY package.json ./ 
COPY yarn.lock ./ 

RUN ls

RUN yarn

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
