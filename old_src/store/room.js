export const KICKED = "KICKED";
export const JOINED = "JOINED";
export const WAITING = "WAITING";
export const NO_REQUEST = "NO_REQUEST";

export const room = {
  namespaced: true,
  state: {
    room: {
      id: null,
      name: "",
      owner: null,
      keepers: [],
      requests: [],
      kicked: [],
      users: [],
      characters: [],
      resources: [],
      gameSystem: null,
      initiative: null,
      activeBoard: null,
      maps: [],
      soundEffects: [],
      music: null,
    },
    requests: [],
    background: false,
  },
  mutations: {
    setRoom(state, payload) {
      state.room = payload.room;
    },
    setRequest(state, payload) {
      state.requests = payload.requests;
    },
    setBackground(state, payload) {
      state.background = payload.background;
    },
  },
  actions: {
    setRoom({ commit }, { room = {} }) {
      console.log("room.setRoom", room); // @DELETEME
      commit("setRoom", { room });
      document.title = room?.name ?? "hiace";
    },
    leaveRoom({ commit }) {
      console.log("room.leaveRoom"); // @DELETEME
      const room = {
        id: null,
        name: "",
        owner: null,
        keepers: [],
        requests: [],
        kicked: [],
        users: [],
        characters: [],
        resources: [],
        gameSystem: null,
        initiative: null,
        activeMap: null,
        maps: [],
        soundEffects: [],
        music: null,
      };
      commit("setRoom", { room });
      document.title = "hiace";
    },
    setRequest({ commit }, { requests = [] }) {
      console.log("room.setRequest", requests); // @DELETEME
      commit("setRequest", { requests });
    },
    windowBlur({ commit }) {
      commit("setBackground", { background: true });
    },
    windowFocus({ commit }) {
      commit("setBackground", { background: false });
    },
  },
  getters: {
    info(state) {
      return state.room;
    },
    grant(state, getters, rootState, rootGetters) {
      const room = getters["info"];
      const user = rootGetters["auth/user"];

      const userId = user.id;
      const { kicked = [], requests = [], users = [] } = room;
      if (kicked.indexOf(userId) !== -1) {
        return { state: KICKED };
      }
      if (users.indexOf(userId) !== -1) {
        return { state: JOINED };
      }
      if (requests.indexOf(userId) !== -1) {
        return { state: WAITING };
      }
      return { state: NO_REQUEST };
    },
    music(state) {
      return state.room?.music ?? null;
    },
    activeBoard(state, getters) {
      return getters["info"]?.activeBoard;
    },
    requests(state) {
      return state.requests;
    },
    gameSystem(state) {
      return state.room?.gameSystem;
    },
    windowInBackground(state) {
      return state?.background;
    },
  },
};
