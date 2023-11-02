import { setDoc, doc, collection, deleteDoc } from "firebase/firestore";
import { db } from "../../util/firestore";
import { Channel } from "../Channel";

interface CreateChannelProps {
  name: string;
  roomId: string;
}

export const createChannel = async (
  props: CreateChannelProps,
): Promise<Channel> => {
  const { name, roomId } = props;

  const c = {
    name: name,
    room: roomId,
  };

  const collectionRef = collection(db, "channel");
  const docRef = doc(collectionRef);
  await setDoc(docRef, c);
  const { id } = docRef;
  return new Channel({
    id,
    name: c.name,
    room: c.room,
  });
};

interface DeleteChannelProps {
  channelId: string;
}

export const deleteChannel = async (
  props: DeleteChannelProps,
): Promise<void> => {
  const { channelId } = props;

  const collectionRef = collection(db, "channel");
  const docRef = doc(collectionRef, channelId);
  await deleteDoc(docRef);
};