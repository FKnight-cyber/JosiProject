import { Container } from './style'
import { useEffect, useState, useContext } from 'react'
import { IoCart } from 'react-icons/io5'
import { Link, useNavigate, useParams } from 'react-router-dom'
import UserContext from '../../context/UserContext'
import axios from 'axios'

export default function PurchaseRegister() {
  const [products, setProducts] = useState([])
  const [confirm, setConfirm] = useState(false)
  const [update, setUpdate] = useState(0)
  const [total, setTotal] = useState(0)
  const [nome, setNome] = useState('')
  const [editedItem, setEditedItem] = useState({id:99999});
  const [newQuantity, setNewQuantity] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [isProductInputAvailable, setIsProductInputAvailable] = useState(false);

  const { purchaseCart, setPurchaseCart }:any = useContext(UserContext);

  const navigate = useNavigate()

  const { id } = useParams()

  async function addPurchase() {
    const body = purchaseCart

    try {
      await axios.post(`${import.meta.env.VITE_URL}/purchases/${id}/add`, body)
      setPurchaseCart([]);
      navigate(-1)
      alert('Compra registrada!')
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/products`)

    promise.then((res) => {
      setProducts(res.data);
      setIsProductInputAvailable(true);
    })
  }, [])

  useEffect(() => {
    // Focus on the price input when it becomes available
    if (isProductInputAvailable) {
      const productInput = document.getElementById("product");
      if (productInput) {
        productInput.focus();
      }
      console.log(productInput)
    }
    
  }, [isProductInputAvailable]);

  function orgazineItems() {
    console.log(purchaseCart)
    purchaseCart.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    )
  }

  function renderProducts() {
    return products.map((product, index) => (
      <Link style={{textDecoration: 'none', color: 'inherit'}} to={`/add/item/${product.id}`}>
        <h1 className='product' key={index}>{product.nome}</h1>
      </Link>
    ))
  }

  const handleSubmit = (event:any) => {
    event.preventDefault();

    if(!editedItem) {
      return;
    }

    const updatedCart = [...purchaseCart];

    const itemIndex = purchaseCart.findIndex(item => item.id === editedItem.id);

    updatedCart[itemIndex].price = newPrice;
    updatedCart[itemIndex].quantity = newQuantity;

    setNewPrice(0);
    setNewQuantity(0);
    setUpdate(0);
    setEditedItem({id:99999})
    setPurchaseCart(updatedCart);
    calculateTotal();
  };
  
  function renderList() {
    return purchaseCart.map((item, index) => (
      <div key={index} className="item">
        <div className='p1' onClick={() => {setUpdate(item.id);setEditedItem(item)}}>
          <h1>{index + 1}</h1>
          <h1>{item.name}</h1>
          <h1>Quantidade: {item.quantity}</h1>
          <h1>
            Preço unitário:{' '}
            {item.price.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            })}
          </h1>
          <h1>
            Total:{' '}
            {(item.price * item.quantity).toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            })}
          </h1>
        </div>
        {
          update === item.id
          ?
          <>
          <div className='p2'>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))} 
              />
              <input 
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))} 
              />
              <button type='submit'>send</button>
            </form>
          </div>
          </>
          :
          ''
        }
      </div>
    ))
  }
  

  function calculateTotal() {
    let soma = 0
    for (const item of purchaseCart) {
      soma += item.price * item.quantity
    }
    setTotal(soma)
  }

  async function findByName(event:any) {
    event.preventDefault()

    try {
      const { data: client } = await axios.get(
        `${import.meta.env.VITE_URL}/products?name=${nome}`,
      )
      const arr = []

      arr.push(client)
      setProducts(arr[0])
    } catch (error) {
      alert(error)
    }
  }

  return (
    <Container>
      {
        confirm 
        ?
        <>
          <h1>Total: {total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h1>
          <div className="confirmation">
          {renderList()}
          </div>
          <button onClick={() => addPurchase()}>Finalizar pedido</button>
          <button className="cancel" onClick={() => setConfirm(false)}>Cancelar</button> 
        </>
        :
        <>
         <div className='cartInfo'>
            <h1 className='number'>{purchaseCart.length}</h1>
            <IoCart className='icon' size={30} color='crimson'/>
          </div>
          <form className="search" onSubmit={findByName}>
            <input
              id="product"
              type="text"
              placeholder="Procurar"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </form>
          <div className="opcoes">
            {products.length > 0 ? renderProducts() : ''}
          </div>
          <button onClick={() => {orgazineItems();calculateTotal();setConfirm(true)}}>Confirmar Compra</button>
        </>
      }
    </Container>
  )
}
