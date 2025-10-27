# Jogo do Banguela

Este sistema web é apenas um front-end e é inspirado em um joguinho, o qual possui um protagonista  que pula cactos "O dinossauro do google", nesse caso, o BANGUELA.

## Estrutura do projeto

- `src/index.html`: página principal com a integração do framework Vue.
- `src/style.css`: estilos do jogo.
- `src/script.js`: lógica do jogo usando Composition API do Vue.
- `src/img/`: imagens utilizadas.
- `Dockerfile`: imagem Nginx que serve os arquivos estáticos da pasta `src`.
- `docker-compose.yaml`: orquestra o contêiner localmente expondo a porta 8080.
- `vercel.json`: configuração de deploy estático na Vercel (apontando para os arquivos em `src/`).

## Como rodar localmente

```bash
docker compose up --build
```
`http://localhost:8080`

ou

```bash
docker build -t jogo-banguela:latest .
docker run --rm -p 8080:80 jogo-banguela:latest
```

## Deploy na Vercel
O arquivo `vercel.json` já aponta o diretório `src` como origem dos arquivos estáticos. Para publicar:

```bash
vercel --prod
```

Na primeira execução a CLI pedirá algumas confirmações:
- defina o diretório raiz como o repositório atual;
- quando questionado pelo diretório de saída, informe `src`.