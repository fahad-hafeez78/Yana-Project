import React from 'react';
import addMenuIllustration from '../../../../assets/addMenuIllustration.png';
import PlusCircle from '../../../../assets/plus-circle-white.svg'

const AddMenuButton = ({ isCollapsed, onClick }) => {
  return (
    <div style={{ backgroundColor: '#d61125' }}
      className={`flex items-center bg-main p-2 ${isCollapsed
        ? 'justify-center rounded-lg m-auto text-white '
        : 'justify-between p-3 rounded-lg shadow-md'
        } `}
    >
      {!isCollapsed ? (
        <div className="flex flex-col">
          <p style={{ color: 'white', textAlign: 'left' }} className="text-white font-light text-xs text-left"
          >Please organize your menus through button below!
          </p>
          <button
            style={{ backgroundColor: '#f2f5f3' }}
            className="bg-[#f2f5f3] text-[#464255] text-[10px] font-light px-2 py-2 rounded-lg mt-2 hover:scale-105 hover:bg-white"
            onClick={onClick}
          >
            Menus
          </button>
        </div>
      ) : (
        <button 
          onClick={onClick} 
          className="p-0 border-none bg-transparent"
        >
          <div className="flex justify-center items-center w-8 h-8 bg-[#d61125] rounded-lg">
            <img 
              src={PlusCircle} 
              alt="plus circle icon" 
              width={26} 
              height={26} 
              className="text-white" 
            />
          </div>
        </button>
      )}
      {!isCollapsed && (
        <img
          src={addMenuIllustration}
          className="w-full max-w-[40px] h-auto"
          alt="Add Menu Illustration"
        />
      )}
    </div>
  );
};

export default AddMenuButton;
