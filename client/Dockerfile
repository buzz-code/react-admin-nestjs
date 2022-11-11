FROM node:14.16.1

WORKDIR /app

RUN ls

COPY package.json ./ 

RUN ls

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
