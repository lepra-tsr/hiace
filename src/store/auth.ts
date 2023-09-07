import { writable, derived } from "svelte/store";
import { AuthStore } from "../model/store/AuthStore";

const auth = writable<AuthStore>(
  new AuthStore({
    name: "",
    photoUrl: "",
    email: "",
  }),
);

auth.subscribe(a => {
  console.log("auth", a); // @DELETEME
});

export const useAuth = () => {
  return {
    subscribe: auth.subscribe,
    setAuth: auth.set,
    /** Googleログイン済みであることを示す */
    authorized: derived(auth, $auth => $auth.LoggedIn),
    name: derived(auth, $auth => $auth.Name),
  };
};
