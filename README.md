# Backoffice DGADR – Digital Signage

Aplicação web de administração para gerir o conteúdo exibido nos ecrãs de sinalética digital da DGADR. Permite gerir funcionários, notícias de rodapé, imagens e newsletters, com sincronização em tempo real via Firebase.

---

## Requisitos

- Node.js 18+
- npm 9+
- Conta Firebase com acesso ao projeto `dgadr-digisignage-app`

## Instalação e arranque

```bash
npm install
npx expo start
```

Para correr apenas na web:

```bash
npx expo start --web
```

---

## Funcionalidades

### Autenticação
- Login com email e palavra-passe institucionais (Firebase Auth)
- Sessão persistente via AsyncStorage — não é necessário fazer login a cada visita
- Logout manual disponível no painel

### Gestão de Funcionários
- Criar, editar e eliminar registos de funcionários
- Campos: nome, ano de início, data de início, data de fim (opcional), departamento
- Listagem agrupada por departamento, ordenada alfabeticamente
- Validação de campos obrigatórios no formulário

### Notícias de Rodapé
- Adicionar, editar e eliminar notícias curtas (máx. 180 caracteres)
- Contador de caracteres com aviso a partir dos 160
- Ordenação automática por data de criação (mais recente primeiro)

### Gestão de Imagens

#### Galeria
- Upload de imagens JPG/PNG (máx. 5 MB) via drag-and-drop ou seleção de ficheiro
- Eliminação de imagens com confirmação
- Imagens guardadas em `/photos/` no Firebase Storage

#### Destaques da Biblioteca
- Upload de imagens de capa para a biblioteca Koha (`/destaques_biblio/`)
- Cada imagem pode ter um link associado no formato:
  `https://biblioteca.dgadr.pt/cgi-bin/koha/opac-detail.pl?biblionumber=XXXXX`
  — o link é automaticamente truncado ao `biblionumber` ao gravar, descartando quaisquer parâmetros adicionais
- Imagens com link duplicado (capas substituídas por uma mais recente) são assinaladas visualmente com um overlay vermelho para facilitar a sua remoção

#### Newsletters
- Criação de newsletters com nome, nome de exibição e cor
- Gestão de números por newsletter: título, descrição, data de publicação, URL e imagem de capa
- Upload de imagem de capa por número, guardada em `newsletters/{nome}/`
- Ordenação por data de publicação (mais recente primeiro)

---

## Estrutura do projeto

```
app/
├── _layout.tsx          — layout raiz com autenticação e tema
├── global.css           — estilos globais web
└── (tabs)/
    └── index.tsx        — entrada principal (Login ou Backoffice)

screens/
├── login.tsx            — ecrã de autenticação
└── backoffice.tsx       — painel principal

components/
├── ImageManager.tsx     — gestor de imagens (3 tabs)
├── ImageCard.tsx        — card de imagem com overlay de capa antiga
├── ImageUploadZone.tsx  — zona de drag-and-drop
├── NewsletterManager.tsx
├── EmployeeEditSimple.tsx
└── ScreenScrollContainer.tsx

hooks/
├── useEmployees.ts
├── useNews.ts
├── useImages.ts
└── useNewsletters.ts

context/
└── AuthContext.tsx      — estado global de autenticação

constants/
├── Types.ts             — interfaces TypeScript
└── theme.ts             — paleta de cores, espaçamentos, sombras
```

---

## Firebase

| Serviço | Utilização |
|---|---|
| Authentication | Login email/palavra-passe |
| Realtime Database | Funcionários, notícias, newsletters |
| Cloud Storage | Imagens da galeria, destaques, capas de newsletters |

**Paths da base de dados:**
- `/employees` — registos de funcionários
- `/news` — notícias de rodapé
- `/newsletters/{id}/issues/{id}` — newsletters e números

**Paths do storage:**
- `/photos/` — galeria geral
- `/destaques_biblio/` — capas da biblioteca
- `/newsletters/{nome}/` — capas de newsletters

---

## Stack técnica

| | |
|---|---|
| Framework | Expo ~51 / React Native 0.74 |
| Web | React Native Web ~0.19 |
| Routing | Expo Router ~3.5 |
| Backend | Firebase 10 (Auth + RTDB + Storage) |
| Linguagem | TypeScript ~5.3 |
| Ícones | Expo Vector Icons (Ionicons) |
