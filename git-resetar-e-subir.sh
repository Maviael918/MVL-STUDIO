#!/bin/bash

# Configurar nome e email
git config --global user.name "Maviael Santos"
git config --global user.email "maviael918@gmail.com"

# Resetar Git (comente esta linha se não quiser apagar o Git atual)
rm -rf .git

# Iniciar novo repositório Git
git init

# Adicionar repositório remoto
git remote add origin https://github.com/Maviael918/MVL-STUDIO.git

# Adicionar todos os arquivos
git add .

# Perguntar a mensagem do commit
echo "Digite a mensagem do commit:"
read mensagem

# Criar o commit
git commit -m "$mensagem"

# Renomear a branch principal
git branch -M main

# Enviar para o GitHub
git push -u origin main

echo "✅ Commit enviado com sucesso para o GitHub!"
