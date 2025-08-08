import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Card from '../../components/menus/card/Card.jsx';
import menu from "../../assets/customIcons/menuIcons/menu.svg";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import clendar from "../../assets/customIcons/menuIcons/calendar.svg";
import menusMiddleware from '../../redux/middleware/menusMiddleware.js';
import Pagination from '../../elements/pagination/Pagination.jsx';
import Spinner from '../../elements/customSpinner/Spinner.jsx';
import SearchBar from '../../elements/searchBar/SearchBar.jsx';
import usePermissionChecker from '../../util/permissionChecker/PermissionChecker.jsx';
import VendorSelectionModal from '../../components/routes/VendorSelectionModal.jsx';
import { usePaginationController } from '../../util/PaginationFilteredData/PaginationController.jsx';
import { usePaginatedData } from '../../util/PaginationFilteredData/PaginatedData.jsx';

const searchBarOptions = [
  { key: 'name' },
  { key: 'vendorId.name' }
];

const Menus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 9);

  // Data state
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  // Permissions
  const checkPermissions = usePermissionChecker();
  const isDeletePermission = checkPermissions('menu', 'delete');
  const isViewPermission = checkPermissions('menu', 'view');
  const canCreateMenu = checkPermissions('menu', 'create');
  const canAssignMenu = checkPermissions('menu', 'menuAssign');

  // Modal state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Paginated data
  const paginatedMenus = usePaginatedData(menus, currentPage, itemsPerPage);
  const [displayMenus, setDisplayMenus] = useState(paginatedMenus);

  // Data fetching
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await dispatch(menusMiddleware.GetAllMenus());
      setMenus(response?.menus || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddMenuClick = () => navigate('add-menu');
  const handleCardClick = (menu) => {
    if (isViewPermission) {
      navigate(`details/${menu._id}`, { state: { menuData: menu } });
    }
  };
  const handleCancel = () => setIsVendorModalOpen(false);
  const handleVendorConfirm = (vendor) => {
    navigate('assignweeks', { state: { vendorId: vendor } });
  };

  // Derived values
  const totalPages = Math.ceil(menus.length / itemsPerPage);

  return (
    <>
      <div className="flex flex-col gap-2 h-full">
        <div className="flex justify-end items-center space-x-4">
          {canCreateMenu && (
            <ButtonWithIcon
              onClick={handleAddMenuClick}
              icon={<img src={menu} alt="Add Menu" width={20} height={20} className="invert" />}
              text="Add Menu"
              variant='secondary'
            />
          )}
          {canAssignMenu && (
            <ButtonWithIcon
              onClick={() => setIsVendorModalOpen(true)}
              icon={<img src={clendar} alt="Assign Weeks" width={24} height={24} className="invert" />}
              text="Menu Assignment"
              variant='primary'
            />
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 font-poppins h-full">
          <div className='flex justify-between'>
            <h2 className="text-2xl font-bold">All Menus</h2>
            <SearchBar
              Data={paginatedMenus}
              setData={setDisplayMenus}
              searchBarOptions={searchBarOptions}
              className="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"
            />
          </div>

          <div className="flex flex-col flex-grow min-h-0 relative">
            <div className="absolute inset-0 overflow-y-auto">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Spinner />
                </div>
              ) : displayMenus.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 px-2">
                  {displayMenus.map((menu) => (
                    <Card
                      key={menu._id}
                      menuId={menu._id}
                      name={menu.name}
                      fetchMenus={fetchMenus}
                      vendorName={menu?.vendorId?.name}
                      imgPath={menu.image}
                      isDeletePermission={isDeletePermission}
                      onClick={() => handleCardClick(menu)}
                      showToggle={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <img
                    src="/No data found.jpg"
                    alt="No data found"
                    className="mx-auto max-h-[220px] object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {!loading && menus.length > 0 && (
            <div className="sticky bottom-0 bg-white z-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={menus.length}
              />
            </div>
          )}
        </div>
      </div>

      {isVendorModalOpen && (
        <VendorSelectionModal 
          onCancel={handleCancel} 
          onConfirm={handleVendorConfirm} 
        />
      )}
    </>
  );
};

export default Menus;