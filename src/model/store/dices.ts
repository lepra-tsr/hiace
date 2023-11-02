import { writable } from "svelte/store";
import { Dice } from "../Dice";

const dices = writable<Dice[]>([]);

dices.subscribe(a => {
  console.log("dices.subscribe", a); // @DELETEME
});

export const useDices = () => {
  return {
    subscribeDices: dices.subscribe,
    setDices: dices.set,
  };
};