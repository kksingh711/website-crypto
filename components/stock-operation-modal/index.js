import React, { useState, useEffect } from 'react';
import styles from '../stock-operation-modal/stock-operation.module.css';
import fetchSelfDetails from '../../utils/fetchSelfDetails';
import fetchData from '../../utils/fetchData';

const StockOperationModal = (props) => {
  const {
    nameOfStock,
    listedPriceOfStock,
    modal,
    showModal,
    transactionType,
    stockId,
  } = props;

  const [quantity, setQuantity] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState('');
  const [userMoney, setUserMoney] = useState();

  const closeModal = () => {
    showModal((prev) => !prev);
    setQuantity('');
  };

  useEffect(() => {
    getUserWallet();
  }, []);

  const getUserWallet = async () => {
    const response = await fetchData(`http://localhost:5000/wallet`, 'GET', {
      credentials: 'include',
    });
    const { wallet } = await response.json();
    if (Object.keys(wallet).length === 0) return setUserMoney(0);
    else {
      const {
        currencies: { dinero },
      } = wallet;
      setUserMoney(dinero);
    }
  };

  getUserWallet();

  useEffect(() => {
    fetchSelfDetails()
      .then((res) => {
        if (res.status === 200) {
          setIsUserLoggedIn(true);
        }
      })
      .catch((err) => {
        console.log('User is not logged in', err);
      });
  }, []);

  const submitHandler = () => {
    if (!isUserLoggedIn) {
      alert('Please log in to continue trading');
    } else if (userMoney === 0) {
      alert('You do not have a wallet!');
    } else if (parseInt(quantity * listedPriceOfStock) > parseInt(userMoney)) {
      alert('You do not have enough money!');
    } else {
      const body = {
        tradeType: transactionType,
        stockName: nameOfStock,
        stockId,
        quantity,
        listedPrice: listedPriceOfStock,
        totalPrice: quantity * listedPriceOfStock,
      };

      fetch('http://localhost:5000/trade/stock/new/self', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error(response.statusText);
          }
        })
        .then((data) =>
          alert(
            `Trading Successful! Your balance is ${data.userBalance} Dineros`
          )
        )
        .catch((err) => {
          alert(err.message);
        });
    }
  };

  return (
    <>
      <div
        className={modal ? styles.backgroundVisible : null}
        onClick={closeModal}
      ></div>{' '}
      {modal ? (
        <div className={styles.modalWrapper}>
          <div className={styles.closedButton} onClick={closeModal}>
            &times;
          </div>
          <div>
            <label className={styles.label} htmlFor="stock-name">
              Stock Name
            </label>
            <input
              className={styles.select}
              type="text"
              name="stock-name"
              id="stock-name"
              value={nameOfStock}
              onChange={() => {}}
            />
            <label className={styles.label} htmlFor="listed-price">
              Listed Price
            </label>
            <input
              className={styles.select}
              type="number"
              name="listed-price"
              id="listed-price"
              value={listedPriceOfStock}
              onChange={() => {}}
            />
            <label className={styles.label} htmlFor="quantity">
              Quantity
            </label>
            <input
              className={styles.select}
              type="number"
              name="quantity"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <label className={styles.label} htmlFor="total-price">
              Total Price
            </label>
            <input
              className={styles.select}
              type="number"
              name="total-price"
              id="total-price"
              value={listedPriceOfStock * quantity}
              onChange={() => {}}
            />
            <button
              className={`${styles.buttonClass} ${
                transactionType === 'BUY'
                  ? styles.greenButton
                  : styles.redButton
              }`}
              disabled={!(nameOfStock && listedPriceOfStock && quantity)}
              onClick={submitHandler}
            >
              {transactionType}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default StockOperationModal;
