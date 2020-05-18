import { Cookies } from "quasar";

export default function() {
  return {
    localState: "uninit",
    treeNotes: [],
    fileTrees: {},
    tags: [],
    loginStatus:
      Cookies.get("user") !== undefined && Cookies.get("user") !== null,
    user: Cookies.get("user") !== undefined ? Cookies.get("user") : null
  };
}
