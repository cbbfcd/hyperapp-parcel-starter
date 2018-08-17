import { app } from 'hyperapp'
import { view } from '@components/counter'
import { state, State } from '@app/models/counter/state'
import { actions, Actions } from '@app/models/counter/actions'
import '@styles/reset.less'
import register from '@app/sw'

app<State, Actions>(state, actions, view, document.getElementById('root'))
register();