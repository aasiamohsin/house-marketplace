import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';

export const CreateListing = () => {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFromData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  // Get  a reference to firebase
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    // Checks if the component is mounted
    if (isMounted) {
      // Set an authentication state observer and get user data.(Observe sign-in state)
      onAuthStateChanged(auth, (user) => {
        // If user Signed-in
        if (user) {
          // Adds userRef in form Data
          setFromData({ ...formData, userRef: user.uid });
        } else {
          // If user is not signed-in redirect to sign-in page
          navigate('/signIn');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFromData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text / Booleans / Numbers
    if (!e.target.files) {
      setFromData((prevState) => ({
        ...prevState,
        // (??) => nullish coalescing operator (if the value on the left side is null then execute the value on the right side)
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Makes sure the discounted price is less than the regular price.
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price should be less then regular price.');
      return;
    }

    // Makes sure images length must be less than 6
    if (images.length > 6) {
      setLoading(false);
      toast.error('Max six images can be added.');
      return;
    }

    let geolocation = {};
    let location;

    // Get Coods with Geocoding API if geolocation is enabled
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );

      const data = await response.json();
      console.log(data);

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address.');
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      // location = address;
    }

    // Store images in firebase
    const storageImage = async (image) => {
      return new Promise((resolve, reject) => {
        // Initialize Storage
        const storage = getStorage();

        // Create file name
        const fileName = `${auth.currentUser.uid}-${image.name}=${uuidv4()}`;

        // Create storage reference to image
        const storageRef = ref(storage, 'images/' + fileName);

        // Uploads the image
        const uploadImage = uploadBytesResumable(storageRef, image);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadImage.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadImage.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    // Gets all the downloadURL and adds in imgUrls
    const imgUrls = await Promise.all(
      [...images].map((image) => storageImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Something went wrong.');
      return;
    });

    // Update form data
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    delete formDataCopy.images;
    delete formDataCopy.address;
    formDataCopy.location = address;

    // location && (formDataCopy.location = location);

    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Add new listing with updated form data in the database
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);

    setLoading(false);
    toast.success('List Added.');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) return <Spinner />;

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'> Create a Listing </p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            type='text'
            className='formInputName'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />
          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>

            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>
          <label className='formLabel'>Parking Spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              id='parking'
              type='button'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              id='parking'
              type='button'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              id='furnished'
              type='button'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!furnished ? 'formButtonActive' : 'formButton'}
              id='furnished'
              type='button'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'> Latitude</label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              id='offer'
              type='button'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              type='number'
              className='formInputSmall'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
            />
            {formData === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>
          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                type='number'
                className='formInputSmall'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6 ).
          </p>
          <input
            type='file'
            className='formInputFile'
            id='images'
            onChange={onMutate}
            max='6'
            // value={images}
            accept='.jpg, .png, .jpeg'
            multiple
            required
          />
          <button className='primaryButton createListingButton' type='submit'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
};
