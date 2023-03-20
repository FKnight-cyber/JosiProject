import { Container } from './style'
import { useEffect, useState } from 'react'
import { IoArrowBackCircleSharp } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function PurchaseRegister() {
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [confirm, setConfirm] = useState(false)
  const [total, setTotal] = useState(0)
  const [nome, setNome] = useState('')

  const navigate = useNavigate()

  const { id } = useParams()

  async function addPurchase() {
    const body = items

    try {
      await axios.post(`${import.meta.env.VITE_URL}/purchases/${id}/add`, body)
      navigate(-1)
      alert('Compra registrada!')
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/products`)

    promise.then((res) => {
      setProducts(res.data)
    })
  }, [])

  function orgazineItems() {
    items.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    )
  }

  function renderProducts() {
    return products.map((product, index) => (
      <label key={index}>
        <input
          type="checkbox"
          value={product.nome}
          onChange={handleCheckboxChange}
        />
        {product.nome}
      </label>
    ))
  }

  function renderList() {
    return items.map((item, index) => (
      <div key={index} className="item">
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
    ))
  }

  function calculateTotal() {
    let soma = 0
    for (const item of items) {
      soma += item.price * item.quantity
    }
    setTotal(soma)
  }

  async function findByName(event) {
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

  const handleCheckboxChange = (event) => {
    const name = event.target.value
    if (event.target.checked) {
      setItems([...items, { name: name, price: '', quantity: '' }])
    } else {
      setItems(items.filter((item) => item.name !== name))
    }
  }

  const handleItemChange = (index, name, value) => {
    const list = [...items]
    list[index][name] = value
    setItems(list)
  }

  return (
    <Container>
      <form className="search" onSubmit={findByName}>
        <input
          type="text"
          placeholder="Procurar"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </form>
      {confirm ? (
        <>
          <h1>
            Total:{' '}
            {total.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            })}
          </h1>
          <div className="confirmation">{renderList()}</div>
          <button onClick={() => addPurchase()}>Finalizar pedido</button>
          <button className="cancel" onClick={() => setConfirm(false)}>
            Cancelar
          </button>
        </>
      ) : (
        <>
          <div className="voltar" onClick={() => navigate(-1)}>
            <IoArrowBackCircleSharp color="crimson" size={60} />
          </div>
          <form>
            <div className="opcoes">
              {products.length > 0 ? renderProducts() : ''}
            </div>
            {items.map((item, index) => (
              <div key={index}>
                <label className="fields">
                  {item.name} Preço:
                  <input
                    type="text"
                    value={item.price}
                    onChange={(event) =>
                      handleItemChange(index, 'price', event.target.value)
                    }
                  />
                </label>
                <label className="fields">
                  {item.name} Quantidade:
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(event) =>
                      handleItemChange(index, 'quantity', event.target.value)
                    }
                  />
                </label>
              </div>
            ))}
            <button
              onClick={() => {
                orgazineItems()
                calculateTotal()
                setConfirm(true)
              }}
            >
              Confirmar Compra
            </button>
          </form>
        </>
      )}
    </Container>
  )
}
