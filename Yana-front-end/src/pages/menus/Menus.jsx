import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/menus/card/Card.jsx';
import menu from "../../assets/menu.svg";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import clendar from "../../assets/calendar.svg";
import { useDispatch } from 'react-redux';
import menusMiddleware from '../../redux/middleware/menusMiddleware.js';
import mealsMiddleware from '../../redux/middleware/mealsMiddleware.js';
import Pagination from '../../elements/pagination/Pagination.jsx';
import Spinner from '../../elements/customSpinner/Spinner.jsx';

const Menus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [menus, setMenus] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 9; // Adjust the number of items per page as needed
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const displayMenus = menus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchMenus = async () => {
    try {
      const response = await dispatch(menusMiddleware.GetAllMenus());
      setLoading(false)
      setMenus(response.data);

    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await dispatch(mealsMiddleware.GetAllMeals());
      setMeals(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchMeals();
  }, []);

  const handleAddMenuClick = () => {
    navigate('addmenus', { state: { menusData: menus, mealsData: meals } });
  };


  const handleMenusClick = () => {
    navigate('assignweeks');
  };

  const handleCardClick = async (menu, meals) => {
    let menuWithMeal;
    try {
      const response = await dispatch(menusMiddleware.GetMenuWithMeals(menu._id));
      menuWithMeal = response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
    }

    navigate(`details/${menuWithMeal._id}`, { state: { menuData: menuWithMeal, mealsData: meals } });
  };


  return (
    // <div>
    <>
      <div className="flex flex-col gap-5">
        <div className="flex justify-end items-center space-x-4">
          <ButtonWithIcon
            onClick={() => handleAddMenuClick()}
            icon={
              <img
                src={menu}
                alt="Add Menu"
                width={20}
                height={20}
                className="invert"
              />
            }
            text="Add Menu"
            className="bg-custom-blue text-white px-3 py-2 rounded-full"
          />
          <ButtonWithIcon
            onClick={handleMenusClick}
            icon={
              <img
                src={clendar}
                alt="Assign Weeks"
                width={24}
                height={24}
                className="invert"
              />
            }
            text="Menu Assignment"
            className="bg-red-600 text-white px-3 py-2 rounded-full inv"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 font-poppins">
          <h2 className="text-2xl font-bold">All Menus</h2>
          {loading ? (
            <Spinner />
          ) : menus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 px-2 lg:grid-cols-3 gap-5 h-[calc(100vh-300px)] overflow-y-auto">

              {displayMenus.map((menu) => (
                <Card
                  key={menu._id.toString()}
                  menuId={menu._id.toString()}
                  name={menu.name}
                  imgPath={menu.image}
                  onClick={() => handleCardClick(menu, meals)}
                  showToggle={false}
                />
              ))}
            </div>

          ) : (
            <div className='flex flex-col h-[calc(100vh-250px)] items-center align-center p-6'>
              <img
                src="/No data found.jpg"
                alt="No data found"
                className={`mx-auto max-h-[220px] object-contain`}
              />
            </div>
          )}
          {!loading && menus.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={menus.length}
            />
          )}
        </div>


      </div>
      {/* // </div> */}
    </>
  );
};

export default Menus;
