import { getName } from "@/scripts/helper";

export const board = {
  namespaced: true,
  state: {
    boards: [],
    drag: null,
  },
  mutations: {
    setBoards(state, payload) {
      state.boards = payload.boards;
    },
    setDrag(state, payload) {
      state.drag = payload.drag;
    },
  },
  actions: {
    setBoards({ commit }, { boards }) {
      console.log("board.setBoards", boards); // @DELETEME
      commit("setBoards", { boards });
    },
    dragStart({ commit }, { boardId }) {
      const $elList = document.getElementsByClassName("__hide_on_drag");
      Array.prototype.forEach.call(
        $elList,
        ($e) => ($e.style.display = "none")
      );
      commit("setDrag", { drag: boardId });
    },
    dragFinish({ commit }) {
      const $elList = document.getElementsByClassName("__hide_on_drag");
      Array.prototype.forEach.call($elList, ($e) => ($e.style.display = ""));
      commit("setDrag", { drag: null });
    },
  },
  getters: {
    info(state) {
      return state.boards;
    },
    divisions(state, getters, rootState, rootGetters) {
      const boards = state.boards;
      const mapList = rootGetters["map/info"];
      const pawnList = rootGetters["pawn/info"];
      const me = rootGetters["auth/user"].id;
      const divisions = [];
      for (let i = 0; i < boards.length; i++) {
        const b = boards[i];
        const pawns = pawnList
          .filter((p) => p.board === b.id)
          .sort((a, b) => {
            if (a.owner !== me && b.owner === me) return 1;
            if (a.owner === me && b.owner !== me) return -1;
            if (a.owner > b.owner) return 1;
            if (a.owner < b.owner) return -1;
            const bName = getName("character", b.character);
            const aName = getName("character", a.character);
            if (aName > bName) return 1;
            if (aName < bName) return -1;
            return 0;
          });
        const maps = mapList.filter((m) => m.board === b.id);
        divisions.push({ id: b.id, pawns, maps });
      }

      return divisions;
    },
    active(state, getters, rootStore, rootGetters) {
      const { activeBoard } = rootGetters["room/info"];
      if (!activeBoard) {
        return null;
      }
      return state.boards.find((b) => b.id === activeBoard);
    },
    dragging(state) {
      return state.drag;
    },
  },
};
