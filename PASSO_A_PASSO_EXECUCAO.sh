#!/bin/bash

# Script de setup e execução do ChinaFácil Backend NestJS
# Execute com: bash PASSO_A_PASSO_EXECUCAO.sh

echo "════════════════════════════════════════════════════"
echo "  🚀 ChinaFácil Backend NestJS - Setup Automático"
echo "════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

echo -e "${YELLOW}[1/7]${NC} Verificando Node.js..."
node --version > /dev/null 2>&1
check_status "Node.js instalado"

echo ""
echo -e "${YELLOW}[2/7]${NC} Instalando dependências..."
npm install
check_status "Dependências instaladas"

echo ""
echo -e "${YELLOW}[3/7]${NC} Verificando MySQL..."
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓${NC} MySQL está instalado"
    
    # Tentar criar banco
    mysql -u root -pa1542321 -e "CREATE DATABASE IF NOT EXISTS chinafacil;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Banco de dados verificado/criado"
    else
        echo -e "${YELLOW}⚠${NC}  Erro ao verificar banco. Verifique credenciais."
    fi
else
    echo -e "${RED}✗${NC} MySQL não encontrado. Instale com: sudo apt install mysql-server"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/7]${NC} Gerando Prisma Client..."
npm run prisma:generate
check_status "Prisma Client gerado"

echo ""
echo -e "${YELLOW}[5/7]${NC} Criando tabelas no banco..."
npx prisma db push --skip-generate
check_status "Tabelas criadas"

echo ""
echo -e "${YELLOW}[6/7]${NC} Executando testes..."
npm run test:int
check_status "Testes passaram"

echo ""
echo -e "${YELLOW}[7/7]${NC} Iniciando aplicação..."
echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ SETUP COMPLETO!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "🚀 Aplicação rodando em: http://localhost:3000"
echo "📚 Swagger docs: http://localhost:3000/api/docs"
echo "🏥 Health check: http://localhost:3000/api/health"
echo "📋 Logs viewer: http://localhost:3000/api/logs"
echo ""
echo "Para parar: Ctrl+C"
echo ""
echo "════════════════════════════════════════════════════"
echo ""

npm run start:dev

