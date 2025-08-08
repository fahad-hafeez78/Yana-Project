import React from 'react';
import Header from '../header/Header';
import SideBars from '../../navigation/sidebar/SideBars';


// In your Layout component
function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <SideBars />
      <div className="flex flex-col flex-grow p-4 gap-3 overflow-hidden">
        <Header />
        <div className="flex-grow overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;