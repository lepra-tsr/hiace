import {
  collection,
  setDoc,
  doc,
  writeBatch,
  query,
  where,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/util/firestore";
import { Pawn } from "@/model/Pawn";

const DEFAULT_CHARACTER_IMAGE = "default_character_image";

interface CreatePawnProps {
  roomId: string;
  userId: string;
  boardId: string;
  imageId?: string;
  characterId: string;
  transform?: string | DOMMatrix;
}

export const createPawn = async (props: CreatePawnProps) => {
  const { roomId, userId, boardId, imageId, characterId, transform } = props;
  const p = {
    room: roomId,
    owner: userId,
    board: boardId,
    image: imageId ?? DEFAULT_CHARACTER_IMAGE,
    character: characterId,
    transform: `${transform ?? new DOMMatrix()}`,
    updatedAt: Date.now(),
  };
  const collectionRef = collection(db, "pawn");
  const docRef = doc(collectionRef);
  await setDoc(docRef, p);

  const { id } = docRef;

  return new Pawn({
    id,
    room: p.room,
    owner: p.owner,
    board: p.board,
    image: p.image,
    character: p.character,
    transform: p.transform,
  });
};

export const fetchPawn = async (pawnId: string): Promise<Pawn> => {
  const pawnDoc = await getDoc(doc(db, "pawn", pawnId));
  if (!pawnDoc.exists()) {
    throw new Error(`Pawn ${pawnId} not found`);
  }
  const p = pawnDoc.data();
  return new Pawn({
    id: pawnDoc.id,
    room: p.room,
    owner: p.owner,
    board: p.board,
    image: p.image,
    character: p.character,
    transform: p.transform,
  });
};

export const clonePawn = async (props: { pawnId: string }) => {
  const { pawnId } = props;
  const sourcePawn = await fetchPawn(pawnId);
  return await createPawn({
    roomId: sourcePawn.room,
    userId: sourcePawn.owner,
    boardId: sourcePawn.board,
    imageId: sourcePawn.image,
    characterId: sourcePawn.character,
    transform: sourcePawn.transform,
  });
};

export const deletePawn = async (props: { pawnId: string }) => {
  const { pawnId } = props;

  const collectionRef = collection(db, "pawn");
  const docRef = doc(collectionRef, pawnId);
  await deleteDoc(docRef);
};

export const deletePawnByBoard = async (props: { boardId: string }) => {
  const { boardId } = props;

  const batch = writeBatch(db);
  const collectionRef = collection(db, "pawn");

  const q = query(collectionRef, where("board", "==", boardId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(d => batch.delete(d.ref));

  await batch.commit();
};

interface UpdatePawnProps {
  pawnId: string;
  criteria: object;
}

export const updatePawn = async (props: UpdatePawnProps) => {
  const { pawnId, criteria } = props;

  const collectionRef = collection(db, "pawn");
  const docRef = doc(collectionRef, pawnId);
  await updateDoc(docRef, criteria);
};

export const touchPawn = async (props: { pawnId: string }) => {
  const { pawnId } = props;
  await updatePawn({ pawnId, criteria: { updatedAt: Date.now() } });
};
