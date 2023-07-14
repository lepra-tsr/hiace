import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";

import store from "@/store";
import { Sound } from "@/scripts/Sound";

async function validateAudioUrl(url: string) {
  return await new Promise((resolve) => {
    const $aud = new Audio();
    $aud.onloadedmetadata = () => resolve(true);
    $aud.onerror = () => resolve(false);
    $aud.src = url;
  });
}

export class FSSound {
  static unsubscribeMap = new Map();

  static async GetById({ id }: { id: string }) {
    console.log("Sound.GetById", id); // @DELETEME
    if (!id) {
      return null;
    }
    const db = firebase.firestore();
    const docRef = await db.collection("sound").doc(id).get();
    if (!docRef.exists) {
      return null;
    }
    const sound = docRef.data();

    if (!sound) {
      throw new Error(`sound does not exist: ${id}`);
    }

    /* urlが消費期限切れなら更新 */
    const url = sound.url;
    const urlIsOk = await validateAudioUrl(url);
    if (!urlIsOk) {
      const path = sound.path;
      sound.url = await FSSound.RenewSoundUrl(path, id);
    }

    return { id, ...sound };
  }

  static async RenewSoundUrl(path: string, id: string) {
    console.log("Sound.RenewSoundUrl");
    const storageRef = firebase.storage().ref();
    const soundRef = storageRef.child(path);
    const url = await soundRef.getDownloadURL();

    const db = firebase.firestore();
    const docRef = db.collection("sound").doc(id);
    await docRef.update({ url });
    return url;
  }

  static async GetSoundMetadata(file: File): Promise<{ duration: number }> {
    /* https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio */
    if (file.type.indexOf("video") !== -1) {
      throw new Error("sorry we not ready for video file yet.");
    }

    const url: string = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      /* 再生はこの時点では行わないので、メタデータのみ取得 */
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        const { duration } = audio;
        resolve({ duration });
      };

      audio.onerror = (e) => {
        reject(e);
      };
      audio.src = url;
    });
  }

  static async Create(file: File | null) {
    if (!(file instanceof File)) {
      throw new Error(`argument must be instance of File()`);
    }

    /* 音声データの解析 */
    const { duration } = await FSSound.GetSoundMetadata(file);

    /* 音声ファイル情報 */
    const name = file.name;
    const size = file.size;
    const contentType = file.type;

    /* owner, roomId */
    const user = store.getters["auth/user"];
    const userId = user.id;

    const room = store.getters["room/info"];
    const roomId = room.id;

    /* fireStorage.path */
    const path = `${userId}/sounds/${name}`;

    const storageRef = firebase.storage().ref();
    const soundRef = storageRef.child(path);

    const metadata = {
      name,
      size,
      contentType,
      duration,
    };

    /* upload to Cloud Storage */
    const url = await new Promise((resolve, reject) => {
      /* upload */
      const uploadTask = soundRef.put(file, metadata);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          /* progress observer */
          console.log(`uploading ${name},`, snapshot.state); // @DELETEME
        },
        (e) => {
          /* on error */
          reject(e);
        },
        async () => {
          /* on complete */
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          console.log("uploading done: ", name); // @DELETEME
          resolve(url);
        }
      );
    });

    const sound = {
      path,
      url,
      tags: [],
      owner: userId,
      room: roomId,
      hidden: false,
      duration,
      loop: false,
      name,
    };
    const db = firebase.firestore();
    const soundDocRef = await db.collection("sound").add(sound);
    const id = soundDocRef.id;
    console.log(`+ register done. "${name}" complete!`); // @DELETEME

    return { id, ...sound };
  }

  static async Update(soundId: string, params: object) {
    const db = firebase.firestore();
    const docRef = db.collection("sound").doc(soundId);
    return await docRef.update(params);
  }

  static async Delete(soundId: string) {
    const sound = Sound.GetById(soundId);
    sound.dispose();

    const db = firebase.firestore();
    const docRef = await db.collection("sound").doc(soundId).delete();

    return docRef;
  }

  static SetListener(roomId: string) {
    console.log("Sound.SetListener", roomId); // @DELETEME

    const { unsubscribeMap } = FSSound;
    if (unsubscribeMap.has(roomId)) {
      FSSound.RemoveListener(roomId);
    }

    const db = firebase.firestore();
    const docsRef = db.collection("sound").where("room", "==", roomId);

    const unsubscribe = docsRef.onSnapshot((querySnapshot) => {
      const sounds: any[] = [];
      querySnapshot.forEach((doc) => {
        const sound = doc.data();
        sound.id = doc.id;
        sounds.push(sound);
      });
      store.dispatch("sound/setSounds", { sounds });
    });
    const listener = { roomId, unsubscribe };
    unsubscribeMap.set(roomId, listener);
  }

  static RemoveListener(roomId: string) {
    const { unsubscribeMap } = FSSound;
    if (!unsubscribeMap.has(roomId)) {
      console.log("no listener found: ", roomId); // @DELETEME
      return false;
    }
    const listener = unsubscribeMap.get(roomId);
    listener.unsubscribe();

    unsubscribeMap.delete(roomId);
  }
}
