const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();

exports.notifyOwnerOnNewMessage = onDocumentCreated(
  'conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const message = event.data?.data();
    if (!message) return;

    const conversationRef = db.doc(`conversations/${event.params.conversationId}`);
    const conversationSnap = await conversationRef.get();
    if (!conversationSnap.exists) return;

    const conversation = conversationSnap.data();
    if (conversation.status !== 'open') return;
    if (message.senderUid === conversation.ownerUid) return;

    const ownerRef = db.doc(`users/${conversation.ownerUid}`);
    const ownerSnap = await ownerRef.get();
    if (!ownerSnap.exists || ownerSnap.data().accessStatus !== 'active') return;

    const tokenSnap = await ownerRef.collection('pushTokens').get();
    if (tokenSnap.empty) {
      logger.info('No registered push tokens for owner', { ownerUid: conversation.ownerUid });
      return;
    }

    const tokens = tokenSnap.docs.map((doc) => ({ id: doc.id, token: doc.id }));
    const baseUrl = 'https://luizcsp.github.io/Achados/';
    const url = `${baseUrl}#chat=${encodeURIComponent(event.params.conversationId)}`;
    const itemLabel = String(conversation.itemName || 'seu item').slice(0, 80);

    // Privacidade: não enviar o conteúdo da mensagem no push.
    const response = await getMessaging().sendEachForMulticast({
      tokens: tokens.map((entry) => entry.token),
      data: {
        title: 'Nova mensagem — Encontrei',
        body: `Alguém enviou uma mensagem sobre ${itemLabel}.`,
        url,
        tag: `conversation-${event.params.conversationId}`,
      },
      webpush: {
        headers: { TTL: '86400' },
        fcmOptions: { link: url },
      },
    });

    const invalidTokenDocs = [];
    response.responses.forEach((result, index) => {
      if (!result.success && [
        'messaging/registration-token-not-registered',
        'messaging/invalid-registration-token',
      ].includes(result.error?.code)) {
        invalidTokenDocs.push(tokens[index].id);
      }
    });

    if (invalidTokenDocs.length) {
      const batch = db.batch();
      invalidTokenDocs.forEach((tokenId) => batch.delete(ownerRef.collection('pushTokens').doc(tokenId)));
      await batch.commit();
    }

    logger.info('Push notification sent', {
      ownerUid: conversation.ownerUid,
      successCount: response.successCount,
      failureCount: response.failureCount,
      removedTokens: invalidTokenDocs.length,
    });
  }
);
