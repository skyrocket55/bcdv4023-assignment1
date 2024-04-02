import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = (props) => {
  return (
    <div className={`d-flex align-items-center ${props.margin}`}>
      {props.title && 
        <h5 className="ml-2">
          <FontAwesomeIcon icon={props.icon} size={props.size}/>
          &nbsp; {props.title}
        </h5>
      }
    </div>
  )
};

export default Header;