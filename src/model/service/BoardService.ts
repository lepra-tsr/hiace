import { collection, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../util/firestore";
import { Board } from "../Board";
import { deleteMapChipByBoard } from "./MapChipService";
import { deletePawnByBoard } from "./PawnService";

export const createBoard = async (props: {
  roomId: string;
}): Promise<Board> => {
  const { roomId } = props;
  const b = {
    room: roomId,
  };

  const collectionRef = collection(db, "board");
  const docRef = doc(collectionRef);
  await setDoc(docRef, b);

  const { id } = docRef;
  return new Board({
    id,
    room: b.room,
  });
};

export const deleteBoard = async (props: { boardId: string }) => {
  const { boardId } = props;
  const collectionRef = collection(db, "board");
  const docRef = doc(collectionRef, boardId);
  await deleteDoc(docRef);

  /* 紐づくMapも削除 */
  await deleteMapChipByBoard({ boardId });

  /* 紐づくPawnも削除 */
  await deletePawnByBoard({ boardId });

  /* 紐づくDiceも削除 */
  // await deleteDiceByBoard(boardId)
};