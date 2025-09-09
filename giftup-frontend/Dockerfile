# Dockerfile simples para desenvolvimento
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies)
RUN npm ci

# Copia todo o código
COPY . ./

# Expõe a porta do Vite
EXPOSE 5173

# Comando para rodar o Vite no dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
