import { Link } from 'react-router-dom';
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg';
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg';

export const Explore = () => {
  return (
    <div className='explore'>
      <header>
        <p className='pageHeader'>Explore</p>
      </header>
      <main>
        {/* Slider */}

        <p className='exploreCategoryHeading'>Categories</p>
        <div className='exploreCategories'>
          <Link to='/category/rent'>
            <img
              className='exploreCategoryImg'
              src={rentCategoryImage}
              alt='rent'
            />
            <p className='exploreCategoryName'>Places for Rent</p>
          </Link>
          <Link to='/category/sale'>
            <img
              className='exploreCategoryImg'
              src={sellCategoryImage}
              alt='sell'
            />
            <p className='exploreCategoryName'>Places for Sell</p>
          </Link>
        </div>
      </main>
    </div>
  );
};
