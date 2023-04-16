import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Cart from '../components/Cart';
import { useStoreContext } from '../utils/GlobalState';
import {
  REMOVE_FROM_CART,
  UPDATE_CART_QUANTITY,
  ADD_TO_CART,
  UPDATE_PRODUCTS,
} from '../utils/actions';
import { QUERY_PRODUCTS } from '../utils/queries';
import { idbPromise } from '../utils/helpers';

import { 
  Container, 
  Grid, 
  Button,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import spinner from '../assets/spinner.gif';

function Detail() {
  const [state, dispatch] = useStoreContext();
  const { id } = useParams();

  const [currentProduct, setCurrentProduct] = useState({});

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  const { products, cart } = state;

  useEffect(() => {
    if (products.length) {
      setCurrentProduct(products.find((product) => product._id === id));
    }
    else if (data) {
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });

      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    }
    else if (!loading) {
      idbPromise('products', 'get').then((indexedProducts) => {
        dispatch({
          type: UPDATE_PRODUCTS,
          products: indexedProducts,
        });
      });
    }
  }, [products, data, loading, dispatch, id]);

  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === id);
    if (itemInCart) {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1,
      });
      idbPromise('cart', 'put', {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1,
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...currentProduct, purchaseQuantity: 1 },
      });
      idbPromise('cart', 'put', { ...currentProduct, purchaseQuantity: 1 });
    }
  };

  const removeFromCart = () => {
    dispatch({
      type: REMOVE_FROM_CART,
      _id: currentProduct._id,
    });

    idbPromise('cart', 'delete', { ...currentProduct });
  };

  return (
    <>
      <Container maxWidth='lg'>
        <Grid container>
          <Grid item xs={12}>
            {currentProduct && cart ? (
              <>
              <Link to='/shop' style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <ArrowBackIcon />
                <h3 style={{ marginLeft: '5px' }}>Back to Products</h3>
              </Link>
              <Divider sx={{ my: 2, mb: 5 }} />
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                />
                <h2>{currentProduct.name}</h2>
                <p>{currentProduct.description}</p>
                <p>
                  <strong>Price: </strong>${currentProduct.price}{' '} <br /> <br />
                  <Button 
                    variant='contained' 
                    size='small'
                    onClick={addToCart}
                    sx={{
                      mt: 2,
                      color: 'white',
                      width: '200px',
                      backgroundColor: 'black',
                      transition: 'background-color 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.02)',
                          color: 'black',
                      },
                      padding: '5px'
                      }}>
                      Add to Cart
                  </Button>
                  <Button
                    variant='contained'
                    size='small'
                    disabled={!cart.find((p) => p._id === currentProduct._id)}
                    onClick={removeFromCart}
                    sx={{
                      mt: 2,
                      color: 'white',
                      width: '200px',
                      backgroundColor: 'black',
                      transition: 'background-color 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.02)',
                          color: 'black',
                      },
                      padding: '5px',
                      marginLeft: '10px'
                      }}>
                    Remove from Cart
                  </Button>
                </p>
              </>
            ) : null}
            {loading ? <img src={spinner} alt='loading' /> : null}
            <Cart />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}  

export default Detail;