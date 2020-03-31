import state from './state'
import * as getters from './getters'
import * as mutations from './mutations'
import * as actions from './actions'

console.log('socket')

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
