const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

admin.initializeApp(functions.config().firebase);


exports.backupmsg = functions.https.onRequest((request, response) => {
  admin.firestore().collection('backup_msg').get()
  .then(snap => snap.docs)
  .then(docs => docs.map(doc => doc.data()))
  .then(docs => docs.map(doc => 
    admin.firestore().collection('backup_msg').doc(doc.id).delete()))
  .then(docs => admin.firestore().collection('messages').get())
  .then(snap => snap.docs)
  .then(docs => docs.map(doc => doc.data()))
  .then(msgs => msgs.map(msg => 
      admin.firestore().collection('backup_msg').doc(`${msg.id}`).set(msg)))
  .then(backup => {
    console.log(`backuped ${backup.length} messages. Backup success!!`);
    res.send(`backuped ${backup.length} messages. Backup success!!`);
    return backup;
  });
});

exports.restoreMsg = functions.https.onRequest((request, response) => {
  admin.firestore().collection('messages').get()
  .then(snap => snap.docs)
  .then(docs => docs.map(doc => doc.data()))
  .then(docs => docs.map(doc => 
    admin.firestore().collection('messages').doc(doc.id).delete()))
  .then(docs => admin.firestore().collection('backup_msg').get())
  .then(snap => snap.docs)
  .then(docs => docs.map(doc => doc.data()))
  .then(msgs => msgs.map(msg => 
      admin.firestore().collection('messages').doc(`${msg.id}`).set(msg)))
  .then(backup => {
    console.log(`restored ${backup.length} messages. Restore success!!`);
    res.send(`restored ${backup.length} messages. Restore success!!`);
    return backup;
  });
});

exports.setId = functions.firestore
  .document('messages/{msgID}').onCreate((event) => {
    var newValue = event.data.data();
    newValue.created = new Date;
    newValue.id = event.params.msgID;
    console.log('set id for: ' + newValue.title);
    return admin.firestore().collection('messages').doc(`${newValue.id}`).set(newValue);
  });

