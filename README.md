<p align="center">
  <img src="public/planet-earth.png" alt="Capitais do Mundo" width="80" />
</p>

<h1 align="center">🌍 Capitais do Mundo</h1>

<p align="center">
  <strong>Quiz interativo sobre capitais, países, bandeiras e geografia mundial.</strong><br/>
  Teste seus conhecimentos com 9+ modos de jogo, multiplayer em tempo real e repetição espaçada!
</p>

<p align="center">
  <a href="https://capitais.vercel.app">🔗 <strong>Jogar Agora</strong></a>
</p>
 
<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Zustand-5-433e38?logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## ✨ Features

### 🎯 Desafios Diários (9 modos)
| Modo | Descrição |
|------|-----------|
| **Desafio Mix** | 10 perguntas variadas — errou, perdeu! |
| **Bandeiras** | Adivinhe o país pela bandeira pixelada |
| **Capital** | Desembaralhe as letras da capital |
| **Termo** | Descubra a capital estilo Wordle (5 tentativas) |
| **Mapa** | Identifique o país no mapa interativo |
| **País** | Descubra o país com dicas progressivas |
| **População** | Ordene países por população |
| **Desafio do País** | Desembaralhe o nome do país |
| **Termo do País** | Wordle com nomes de países |

### 🏆 Desafios Supremos
Modo hardcore: complete o mapa mundi inteiro acertando todas as capitais e países.

### 🌐 Multiplayer Online
Desafie amigos em tempo real com salas privadas via Firebase Realtime Database.

### 🧠 Repetição Espaçada (SRS)
Sistema de flashcards com algoritmo de espaçamento para memorização de longo prazo.

### 🎮 Modos de Prática
- **Clássico** — Quiz de múltipla escolha
- **Morte Súbita** — Erre uma e acabou (com timer!)
- **Sobrevivência** — Quantos você acerta em sequência?
- **Escrita** — Digite a resposta sem ajuda
- **Anagrama** — Desembaralhe as letras

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 7 |
| **Estado** | Zustand 5 |
| **Roteamento** | React Router v7 |
| **Backend** | Firebase Realtime Database |
| **Mapas** | Leaflet + React-Leaflet |
| **Estilo** | TailwindCSS 3 |
| **Testes** | Vitest |
| **Deploy** | Vercel (com Analytics) |
| **Ícones** | Lucide React |
| **Efeitos** | Canvas Confetti |

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Home.tsx         # Tela principal com grid de desafios
│   ├── Daily*.tsx       # 9 modos de desafio diário
│   ├── Supreme*.tsx     # Modo supremo (hardcore)
│   ├── online/          # Multiplayer em tempo real
│   └── srs/             # Sistema de repetição espaçada
├── hooks/               # Custom hooks
│   ├── useGameStore.ts  # Estado global do quiz (Zustand)
│   ├── useDaily*.ts     # Lógica dos desafios diários
│   ├── useOnlineGame.ts # Lógica multiplayer Firebase
│   └── useSrsStore.ts   # Algoritmo SRS
├── services/            # Integrações externas
│   ├── firebase.ts      # Configuração Firebase
│   └── roomService.ts   # CRUD de salas multiplayer
├── data/                # Dados estáticos
│   └── countries.ts     # 195 países com capitais e metadados
├── utils/               # Funções utilitárias
│   ├── validation.ts    # Validação de respostas (com aliases)
│   ├── daily.ts         # Geração determinística diária
│   └── confetti.ts      # Efeitos visuais de celebração
└── App.tsx              # Roteamento e layout principal
```

---

## 🚀 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/VitorHsC9/capitais.git
cd capitais

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Firebase

# Rode o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de lint |
| `npm run test` | Executar testes |

---

## ⚡ Destaques Técnicos

- **Code Splitting**: Lazy loading com `React.lazy()` + `Suspense` em todas as rotas
- **Multiplayer em tempo real**: Firebase Realtime Database com listeners de eventos
- **Algoritmo SRS**: Repetição espaçada inspirado no Anki para retenção de longo prazo
- **Geração determinística**: Desafios diários gerados por seed baseada na data (mesmo desafio para todos)
- **Validação inteligente**: Aceita variações de nomes, aliases e grafias alternativas
- **Mapa interativo**: GeoJSON com 195 países renderizados via Leaflet
- **Keyboard shortcuts**: Atalhos numéricos (1-5) para resposta rápida
- **Responsivo**: Layout adaptável para mobile, tablet e desktop

---

## 📄 Licença

Este projeto é de código aberto. Sinta-se à vontade para usar como referência.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/VitorHsC9"><strong>Vitor</strong></a>
</p>
