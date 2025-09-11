import { useEffect, useState, useRef, useContext } from "react";
import { Container } from "./style";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UserContext from "../../context/UserContext";

export default function AddProduct() {
  const [item, setItem] = useState();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isPriceInputAvailable, setIsPriceInputAvailable] = useState(false);
  const quantityInputRef = useRef(null);
  const { id } = useParams();

  const { purchaseCart, setPurchaseCart } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/products/${id}`);

    promise.then((res) => {
      setItem(res.data);

      setIsPriceInputAvailable(true);
    });
  }, []);

  useEffect(() => {
    // Focus on the price input when it becomes available
    if (isPriceInputAvailable) {
      const priceInput = document.getElementById("price");
      if (priceInput) {
        priceInput.focus();
      }
    }
    quantityInputRef.current = document.getElementById('quantity');
  }, [isPriceInputAvailable]);

  const handlePriceInputEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quantityInputRef.current.focus();
    }
  };

  const handleQuantityInputEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToCart(e);
    }
  };

  function addToCart(event) {
    event.preventDefault();
    
    const purchase = {
      id,
      name: item.nome,
      price: Number(price),
      quantity: Number(quantity)
    }
  
    const arr = [...purchaseCart, purchase];
    setPurchaseCart(arr);
    navigate(-1);
  }
  
  return(
    <Container>
      {
        item ?
        <div className="item">
          <h1>Produto: {item.nome}</h1>
          <form onSubmit={addToCart}>
            <div>
              <label htmlFor="price">Preço:</label>
              <input 
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handlePriceInputEnter}
              />
            </div>
            <div>
              <label htmlFor="quantity">Quantidade:</label>
              <input 
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                ref={quantityInputRef}
                onKeyDown={handleQuantityInputEnter}
              />
            </div>
            <button type="submit">
              Add Product
            </button>
          </form>
        </div> 
        : 
        ''
      }
    </Container>
  )
}
