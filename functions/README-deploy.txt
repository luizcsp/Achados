ENCONTREI — PUBLICAR A CLOUD FUNCTION DE PUSH

ATENÇÃO: a publicação de Cloud Functions exige Firebase CLI e normalmente o plano Blaze com faturamento ativado no projeto. Revise limites e custos no Firebase antes de ativar.

1) Faça backup do seu index.html e firebase-messaging-sw.js atuais no GitHub.
2) Baixe a pasta functions/ deste pacote e coloque-a na raiz local do repositório Achados.
3) Na raiz do repositório, crie firebase.json com:
   {
     "functions": [{ "source": "functions", "codebase": "default" }]
   }
   Se já existir firebase.json, faça merge sem apagar configurações atuais.
4) Instale Node.js LTS e Firebase CLI em um computador. No terminal, dentro da raiz do projeto:
   npm install -g firebase-tools
   firebase login
   firebase use --add
   Selecione o projeto achados-e-perdidos-5ba1d
   cd functions && npm install && cd ..
   firebase deploy --only functions:notifyOwnerOnNewMessage
5) O código de functions/index.js usa o Admin SDK no servidor. NÃO copie service-account.json, chave privada ou credencial administrativa para o site/GitHub.
6) O app da Web já deve ter a VAPID pública configurada no index.html e o service worker firebase-messaging-sw.js na raiz do site.
7) No Console, aprove o perfil do proprietário (users/UID com accessStatus='active'), entre no app e toque em “Ativar avisos neste aparelho”.
8) Teste com duas sessões: visitante manda mensagem; o proprietário deve receber notificação. No primeiro teste, mantenha o app em background/fechado e verifique permissões do navegador.

Observações:
- URL usada no push: https://luizcsp.github.io/Achados/#chat=CONVERSATION_ID
- A função envia título e aviso genérico; não coloca texto privado da mensagem na notificação.
- O worker deve estar publicado em https://luizcsp.github.io/Achados/firebase-messaging-sw.js e usar a configuração Firebase correta.
- Se o browser detectar service worker velho, remova os dados do site ou cancele o registro antigo e tente de novo.
- iPhone/iPad requer suporte a Web Push e, em versões compatíveis do iOS/iPadOS, normalmente instalação do site na Tela de Início.
