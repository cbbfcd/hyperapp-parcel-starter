import { h, View } from 'hyperapp'
import { State } from '@app/models/counter/state'
import { Actions } from '@app/models/counter/actions'
import { Description } from '../description/Description'
import './index.less'

export const view: View<State, Actions> = (state, actions) => (
  <div className='wrapper'>
    <Description desc='Hyperapp Stater Via Parcel And TypeScript'/>
    <div className='counter'>
      <h1>{ state.count }</h1>
      <div>
        <a onclick={() => actions.up(1)}>+</a>
        <a onclick={() => actions.down(1)}>-</a>
      </div>
    </div>
  </div>
)
