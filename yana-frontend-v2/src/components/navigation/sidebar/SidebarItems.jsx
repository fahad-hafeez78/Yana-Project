import React from 'react';
import {
  DashBoardIcon,
  MealsIcon,
  MenusIcon,
  ParticipantsIcon,
  OrdersIcon,
  PersIcon,
  ReviewsIcon,
  UmsIcon,
  ChatsIcon,
  VendorsIcon,
  RoutesTrackingIcon,
  TasksIcon,
  TrashIcon,
  BillingIcon
} from '../../../assets/customIcons/sidebarIcons/SidebarIcons';

const allSidebarItems = [
  { to: "/dashboard", icon: <DashBoardIcon />, label: "Dashboard", permission: "dashboard" }, // Removed permission requirement
  { to: "/orders", icon: <OrdersIcon />, label: "Orders", permission: "order" },
  {
    to: "/participants",
    icon: <ParticipantsIcon />,
    label: "Participants",
    hasSubmenu: true,
    subItems: [
      { to: "/participants", label: "All Participants", permission: "participant" },
      { to: "/participant-changes", label: "Participants Changes", permission: "participant_changes" },
      { to: "/participants-requests", label: "Participants Requests", permission: "participant_requests" },
    ],
  },
  { to: "/meals", icon: <MealsIcon />, label: "Meals", permission: "meal" },
  { to: "/menus", icon: <MenusIcon />, label: "Menus", permission: "menu" },
  { to: "/vendors", icon: <VendorsIcon />, label: "Vendors", permission: "vendor" },
  { to: "/reviews", icon: <ReviewsIcon />, label: "Reviews", permission: "review" },
  {
    to: "/users",
    icon: <UmsIcon />,
    label: "UMS",
    hasSubmenu: true,
    subItems: [
      { to: "/roles", label: "Roles", permission: "role" },
      { to: "/users", label: "Users", permission: "user" },
    ],
  },
  { to: "/chats", icon: <ChatsIcon />, label: "Chats", permission: "chat" },
  {
    to: "/tasks",
    icon: <TasksIcon />,
    label: "Tasks & Tickets",
    hasSubmenu: true,
    subItems: [
      { to: "/tasks", label: "Tasks", permission: "task" },
      { to: "/tickets", label: "Tickets", permission: "ticket" },
    ],
  },
  {
    to: "/riders",
    icon: <RoutesTrackingIcon />,
    label: "Tracking & Routes",
    hasSubmenu: true,
    subItems: [
      { to: "/riders", label: "Riders", permission: "rider" },
      // { to: "/zones", label: "Zone", permission: "zone" },
      // { to: "/order-assignment", label: "Order Assignment", permission: "routesassignments" },
      { to: "/routes", label: "Routes", permission: "route" },
    ],
  },
  { to: "/pers", icon: <PersIcon />, label: "PERS", permission: "pers" },
  { to: "/trash", icon: <TrashIcon />, label: "Trash", permission: "soft_delete" },
  {
    to: "/billing/dashboard",
    icon: <BillingIcon />,
    label: "Billing",
    hasSubmenu: true,
    subItems: [
      { to: "/billing/dashboard", label: "Dashboard", permission: "claim" },
      { to: "/billing/claims", label: "Claims", permission: "claim" },
    ],
  },
];

// Recursive function to filter sidebar items based on permissions
const getFilteredSidebarItems = (items, permissions) => {
  return items
    .map(item => {
      if (item.permission === "dashboard") return item;

      if (item.hasSubmenu && item.subItems) {
        const filteredSubItems = getFilteredSidebarItems(item.subItems, permissions);
        return filteredSubItems.length > 0
          ? { ...item, subItems: filteredSubItems }
          : null;
      }
      return permissions.includes(item.permission) ? item : null;
    })
    .filter(Boolean);
};

// SidebarItems Component
const SidebarItems = () => {

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let allowedPages = [];

  if (user?.role?.name === 'admin') {
    allowedPages = [...user.role.permissions.flatMap(permission => permission.page), 'soft_delete', 'role'];
  } else {
    allowedPages = user.role.permissions.flatMap(permission => permission.page);
  }

  const sidebarItems = getFilteredSidebarItems(allSidebarItems, allowedPages);
  return sidebarItems;
};

export default SidebarItems;