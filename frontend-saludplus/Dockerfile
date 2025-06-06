FROM node:20

RUN apt-get update && apt-get install -y git

WORKDIR /app

ARG REPO_URL=https://github.com/Grupo3-SaludPlus/Saludplus-solo.git
RUN git clone ${REPO_URL} .

RUN npm install -g @angular/cli

WORKDIR /app/frontend-saludplus
RUN npm install

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]