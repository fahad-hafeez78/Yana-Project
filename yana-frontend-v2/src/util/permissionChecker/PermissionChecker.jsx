import { useSelector } from "react-redux";

const usePermissionChecker = () => {
  const user = useSelector((state) => state.user?.user);
  
  return (page, action) => {
    const pagePermission = user?.role?.permissions?.find((perm) => perm.page === page);
    return pagePermission?.actions?.includes(action) || false;
  };
};

export default usePermissionChecker;
