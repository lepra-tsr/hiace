import { derived, writable } from "svelte/store";
import { Room } from "../Room";

const room = writable<Room>(
  new Room({
    id: "",
    name: "",
    owner: "",
    keepers: [],
    requests: [],
    kicked: [],
    users: [],
    gameSystem: "",
    music: "",
  }),
);

room.subscribe(a => {
  console.log("room.subscribe", a); // @DELETEME
});

/** Googleログイン後、roomへの入室リクエストを確認するためのuserId */
const userIdForRoomState = writable<string>("");
userIdForRoomState.subscribe(u => {
  console.log("userIdForRoomState.subscribe", u);
});

export const useRoom = () => {
  return {
    subscribeRoom: room.subscribe,
    setRoom: room.set,
    roomId: derived(room, $room => $room.id),
    room,
    userIdForRoomState,
    setUserIdForRoomState: userIdForRoomState.set,
  };
};