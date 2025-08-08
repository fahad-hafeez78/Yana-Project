import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate, useNavigation } from 'react-router-dom';
import { toggleSidebar } from '../../../redux/reducers/sidebarReducer';
import leftarrow from "../../../assets/customIcons/sidebarIcons/expandIcon.svg";
import logoCollapsed from '../../../assets/customIcons/sidebarIcons/logoCollapsed.svg';
import sidebarItems from './SidebarItems';
import { ExpandableIcon } from '../../../assets/customIcons/sidebarIcons/SidebarIcons';

export default function SideBars() {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleSubMenu = (submenuId) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [submenuId]: !prev[submenuId],
        }));
    };

    const toggleSidebarState = () => {
        dispatch(toggleSidebar());
    };

    return (
        <div
            className={`flex flex-col justify-between bg-white gap-2 h-screen transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0`}
        >
            {/* Logo and Collapse Button */}
            <div className="flex items-center justify-between p-5">
                <img src='/YanaLogo.png' alt="YANA Logo" height="10px" className={`${isCollapsed ? 'w-0 h-0 opacity-0' : 'overflow-hidden'}`} />
                {isCollapsed ? (
                    <img src={logoCollapsed} alt="Collapsed Logo" className="h-10 hover:scale-110 cursor-pointer" onClick={toggleSidebarState} />
                ) : (
                    <img src={leftarrow} alt="Collapse Icon" className="hover:scale-110 cursor-pointer" onClick={toggleSidebarState} />
                )}
            </div>

            {/* Below menu */}
            <nav className={`px-5 flex-grow overflow-y-auto ${!isCollapsed && 'overflow-x-hidden'}`}>
                <ul className="flex flex-col gap-1.5 justify-center">
                    {sidebarItems().map(({ to, icon, label, hasSubmenu, subItems }) => (
                        <li key={to} className="flex flex-col gap-1.5">
                            {/* Render NavLink only if there is no submenu */}
                            {!hasSubmenu ? (
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex font-medium p-1.5 rounded-lg relative gap-4 hover:text-white hover:bg-secondary-dark ${isActive
                                            ? `text-white bg-secondary ${isCollapsed
                                                ? "before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-9 before:h-9 before:rounded-md before:transform before:-translate-x-1/2 before:-translate-y-1/2"
                                                : "text-white before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary before:rounded-l-md"
                                            }`
                                            : `text-gray-800`
                                        } ${isCollapsed ? 'justify-center rounded-full' : ''}`
                                    }
                                >
                                    <div className="group flex relative ">
                                        <span className="flex items-center justify-center" >{React.cloneElement(icon, { isActive: to === window.location.pathname })}</span>

                                        {isCollapsed && (
                                            <span className="group-hover:opacity-100 transition-opacity bg-secondary text-sm text-primary rounded-md absolute left-full ml-5 px-2 py-1 opacity-0 z-50">
                                                {label}
                                            </span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{label}</span>
                                        </div>
                                    )}
                                </NavLink>
                            ) : (
                                // Handle submenu behavior here
                                <div
                                    className={`cursor-pointer flex font-medium p-1.5 rounded-lg relative gap-4 hover:bg-secondary-dark hover:text-white ${subItems?.some(subItem => window.location.pathname === subItem.to) ? 'text-white bg-secondary' : ''
                                        ? `text-white bg-secondary ${isCollapsed
                                            ? "before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-9 before:h-9 before:rounded-md before:transform before:-translate-x-1/2 before:-translate-y-1/2"
                                            : "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-red-600 before:rounded-l-md"
                                        }`
                                        : `text-gray-800`
                                        } ${isCollapsed ? 'justify-center rounded-full' : ''}`}
                                    onClick={() => toggleSubMenu(to)}
                                >
                                    <div className="group flex relative ">
                                        <span className="flex items-center justify-center">{React.cloneElement(icon, { isActive: subItems?.some(subItem => window.location.pathname === subItem.to) })}</span>

                                        {isCollapsed && (
                                            <span className="group-hover:opacity-100 transition-opacity bg-secondary text-sm text-white rounded-md absolute left-full ml-5 px-2 py-1 opacity-0 z-50">
                                                {label}
                                            </span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{label}</span>
                                            <ExpandableIcon isExpanded={expandedMenus[to]} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Render Submenus Dynamically */}
                            {hasSubmenu && expandedMenus[to] && !isCollapsed && (
                                <ul className="flex flex-col gap-1.5 ml-10 list-none p-0 m-0">
                                    {subItems?.map(({ to: subTo, label: subLabel }) => (
                                        <li key={subTo}>
                                            <NavLink
                                                to={subTo}
                                                onClick={() => navigate(subTo)}  // Handle click
                                                className={({ isActive }) =>
                                                    `hover:bg-secondary-dark flex items-center font-medium p-1.5 text-sm transition-colors rounded ${isActive ? 'text-white bg-secondary' : 'text-gray-800 hover:text-white'
                                                    }`
                                                }
                                            >
                                                {subLabel}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}

                </ul>
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="text-center p-5">
                    <span className="block text-xs text-gray-400 font-semibold">Yana Medical Dashboard</span>
                    <span className="block text-xs text-gray-400">© All Rights Reserved</span>
                </div>
            )}
        </div>

    );
}
