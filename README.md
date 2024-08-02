# Projeto de API Simples em Node.js com Docker

## Descrição do Projeto

Este projeto web é apenas em front-end e é inspirado em um joguinho, o qual possui um protagonista  que pula cactos "O dinossauro do google", o projeto tem como objetivo demonstrar a utilização da ferramenta docker, fora as outras como html, javascript e css...

## Aplicação em Execução

![imagem](jogo-do-banguela/img/image.png)

## Propósito da Aplicação

O obejtivo desse jogo é você não deixar o banguela falecer para um cacto.

## Estrutura do Projeto

- *img*: Essa pasta contém todas as imagens.
- *index.html*: É a página.
- *script*: É o que permite ter o sistema de pontuação, fazer o banguela andar e pular.
- *style.css*: Estiliza a página.

## Instruções para Execução

### Requisitos

- Ter o docker instaldo.


## Link para DockerHub

https://hub.docker.com/repository/docker/krauzzer/api-node-docker/general

## Dockerfile

O `Dockerfile` utilizado para criar a imagem Docker da aplicação contém as seguintes instruções:

FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

## Executando

- Puxe o container: `docker pull jogo-do-banguela`;
- Rode o docker: `docker run -d -p 8080:80 jogo-do-banguela`
- Abra seu navegador e vá para `http://localhost:8080` para verificar se os arquivos estão sendo servidos corretamente.


