import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import store from "@/store";

export class FSUser {
  static unsubscribeMap = new Map();

  static async GetById({ id }) {
    const db = firebase.firestore();
    const docRef = await db
      .collection("user")
      .doc(id)
      .get();
    if (!docRef.exists) {
      return null;
    }
    const user = docRef.data();
    user.id = id;
    return user;
  }

  static async GetByEmail({ email }) {
    const db = firebase.firestore();
    return db
      .collection("user")
      .where("email", "==", email)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        let result = null;
        snapshot.forEach(d => {
          result = d.data();
          result.id = d.id;
        });
        return result;
      });
  }

  /** select&update or insert */
  static async Create() {
    const db = firebase.firestore();
    const me = firebase.auth().currentUser;

    /* 既に同じメールアドレスでユーザが作成されていたらアイコンURLだけ期限があるので更新 */
    const email = me.email;
    const user = await FSUser.GetByEmail({ email });
    if (user) {
      await FSUser.Update(user.id, { photoUrl: me.photoURL });
      user.photoURL = me.photoURL;
      return user;
    }

    /* 新規作成 */
    const u = {
      sys: { created: Date.now() },
      name: me.displayName,
      photoUrl: me.photoURL,
      email: me.email,
      joinTo: []
    };
    const ref = await db.collection("user").add(u);
    u.id = ref.id;

    return u;
  }

  static async Update(id, criteria = {}) {
    const db = firebase.firestore();
    const doc = db.collection("user").doc(id);
    return await doc.update(criteria);
  }

  static async JoinRoom(userId, roomId) {
    const db = firebase.firestore();
    const userDoc = db.collection("user").doc(userId);
    const userRef = await userDoc.get();
    const user = userRef.data();

    const { joinTo = [] } = user;
    if (joinTo.indexOf(roomId) !== -1) {
      console.log("already joined"); // @DELETEME
      return false;
    }
    joinTo.push(roomId);
    await userDoc.update({ joinTo });
  }

  static SetListener(roomId) {
    console.log("User.SetListener"); // @DELETEME
    FSUser.RemoveListener();

    const db = firebase.firestore();
    const docsRef = db
      .collection("user")
      .where("joinTo", "array-contains", roomId);

    const unsubscribe = docsRef.onSnapshot(querySnapshot => {
      const users = [];
      querySnapshot.forEach(doc => {
        const user = doc.data();
        user.id = doc.id;
        users.push(user);
      });
      store.dispatch("user/setUsers", { users });
    });

    const { unsubscribeMap } = FSUser;
    const listener = { id: roomId, unsubscribe };
    unsubscribeMap.set(roomId, listener);
  }

  static RemoveListener() {
    console.log("User.RemoveListener"); // @DELETEME
    const { unsubscribeMap } = FSUser;
    const listeners = unsubscribeMap.values();
    for (const l of listeners) {
      const { id, unsubscribe } = l;
      unsubscribe?.();
      console.log(`unsubscribed: ${id}`); // @DELETEME
    }

    unsubscribeMap.clear();
  }
}
