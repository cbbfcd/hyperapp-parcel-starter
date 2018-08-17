import { h, View } from 'hyperapp'
import './index.less'
import hp from '@assets/hp.png'

export const Description: View<any, any> = ({ desc }) => (
  <div className='container'>
    <div className='box-wrapper'>
      <div className='box'>
        <h1 className='title'>{ desc }</h1>
      </div>
    </div>
    <img src={ hp } className='img' alt='parcel-hyperapp'/>
  </div>
)
