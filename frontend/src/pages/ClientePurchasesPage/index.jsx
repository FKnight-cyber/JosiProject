import { useEffect, useState } from "react"
import axios from "axios";
import { Container } from "./style";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  TextField,
  Stack
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

export default function ClientePurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [purchase, setPurchase] = useState({});
  const [changeState, setChangeState] = useState(0);
  const [initialDate, setInitialDate] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cliente, setCliente] = useState();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchPurchases();
  },[changeState, currentPage, itemsPerPage, initialDate, finalDate, statusFilter]);

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/${id}`);

    promise.then(res => {
      setCliente(res.data);
    });
  },[])

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [initialDate, finalDate, statusFilter]);

  async function fetchPurchases() {
    try {
      // Determinar a URL base baseada no ambiente
      const baseURL = import.meta.env.VITE_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://mycontrol-production.up.railway.app');
      
      let url = `${baseURL}/clients/${id}/purchases?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (initialDate && finalDate) {
        url += `&initial=${initialDate}&final=${finalDate}`;
      }
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      console.log('=== DEBUG FETCH PURCHASES ===');
      console.log('URL:', url);
      console.log('Base URL:', baseURL);
      console.log('VITE_URL:', import.meta.env.VITE_URL);
      console.log('Window location:', window.location.hostname);
      
      const response = await axios.get(url);
      const result = response.data;
      
      console.log('Response status:', response.status);
      console.log('Response data:', result);
      console.log('Response data type:', typeof result);
      console.log('Is array?', Array.isArray(result));
      
      // Verificar se o resultado é um array ou um objeto
      let purchasesData, totalPagesData, totalItemsData;
      
      if (Array.isArray(result)) {
        // Se é um array, usar diretamente
        purchasesData = result;
        totalPagesData = 1;
        totalItemsData = result.length;
        console.log('Result is array, using directly');
      } else {
        // Se é um objeto, extrair as propriedades
        purchasesData = result.purchases || [];
        totalPagesData = result.totalPages || 1;
        totalItemsData = result.total || 0;
        console.log('Result is object, extracting properties');
      }
      
      console.log('Final purchases data:', purchasesData);
      console.log('Final purchases length:', purchasesData?.length);
      
      setPurchases(purchasesData);
      setTotalPages(totalPagesData);
      setTotalItems(totalItemsData);
      setPurchase({});
      
      console.log('State updated - purchases length:', purchasesData?.length);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      console.error('Error details:', error.response?.data);
      setPurchases([]);
    }
  }

  function clearFilters() {
    setInitialDate('');
    setFinalDate('');
    setStatusFilter('all');
  }

  async function removePurchaseRegister(purchaseId) {
    try {
      await axios.delete(`${import.meta.env.VITE_URL}/purchases/${purchaseId}/delete`);
      alert("Registro removido!");
      setChangeState(changeState+1);
    } catch (error) {
      alert(error);
    }
  }

  function calculatePurchaseValue(purchase) {
    console.log('=== DEBUG CALCULATE VALUE ===');
    console.log('Purchase:', purchase);
    console.log('Purchase.valor:', purchase.valor);
    console.log('Purchase.valorTotal:', purchase.valorTotal);
    
    // Se tem valorTotal, usar ele
    if (purchase.valorTotal) {
      console.log('Using valorTotal:', purchase.valorTotal);
      return purchase.valorTotal;
    }
    
    // Se tem array de valores, somar todos
    if (purchase.valor && Array.isArray(purchase.valor) && purchase.valor.length > 0) {
      const total = purchase.valor.reduce((sum, val) => sum + (val || 0), 0);
      console.log('Calculated from valor array:', total);
      return total;
    }
    
    // Se tem produtos, calcular a partir dos produtos
    if (purchase.produtos && Array.isArray(purchase.produtos) && purchase.produtos.length > 0) {
      const total = purchase.produtos.reduce((sum, produto) => {
        return sum + ((produto.price || 0) * (produto.quantity || 0));
      }, 0);
      console.log('Calculated from produtos:', total);
      return total;
    }
    
    console.log('No value found, returning 0');
    return 0;
  }

  function getStatus(purchase) {
    return purchase.status === "CONCLUIDO" ? "Concluído" : "Pendente";
  }

  function getStatusColor(purchase) {
    return purchase.status === "CONCLUIDO" ? "success" : "warning";
  }

  function handlePageChange(event, newPage) {
    setCurrentPage(newPage);
  }

  function handleItemsPerPageChange(event) {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset para primeira página
  }

  return(
    <Container>
      {/* Header compacto */}
      <Box sx={{ mb: 2 }}>
        {/* Primeira linha: Título e botão voltar */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Compras do Fornecedor: {cliente ? cliente.name : ""}
          </Typography>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ 
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Segunda linha: Botões de ação */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/clients/${id}/transactions`)}
            sx={{ minWidth: 120 }}
          >
            Transações
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate(`/purchases/${id}`)}
            sx={{ minWidth: 120 }}
          >
            Nova Compra
          </Button>
        </Box>

        {/* Terceira linha: Filtros */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              type="date"
              label="Data Inicial"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              type="date"
              label="Data Final"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              type="button"
              variant="outlined"
              onClick={clearFilters}
              sx={{ minWidth: 100 }}
            >
              Limpar
            </Button>
          </Stack>
        </Box>
      </Box>
      
      
      {purchases && purchases.length > 0 && (
         <Box sx={{ width: '100%' }}>
           {console.log('Renderizando tabela, purchases:', purchases, 'length:', purchases.length)}
           <Paper sx={{ boxShadow: 3 }}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="tabela de compras">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valor da Compra</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((purchase, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'grey.50' },
                        '&:hover': { backgroundColor: 'grey.100' }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body1" fontWeight="medium">
                          {purchase.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(purchase.createdAt).toLocaleDateString('pt-br')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {calculatePurchaseValue(purchase).toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatus(purchase)}
                          color={getStatusColor(purchase)}
                          variant="filled"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/clients/${id}/purchases/${purchase.id}`)}
                            title="Visualizar compra"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          
                          {purchase.status !== "CONCLUIDO" && (
                            <IconButton
                              color="secondary"
                              onClick={() => navigate(`/clients/${id}/purchases/${purchase.id}/payment`)}
                              title="Efetuar pagamento"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          
                          {purchase.status !== "CONCLUIDO" && (
                            <IconButton
                              color="error"
                              onClick={() => removePurchaseRegister(purchase.id)}
                              title="Excluir compra"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Footer da tabela com paginação */}
            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              backgroundColor: 'grey.50',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} compras
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Por página</InputLabel>
                  <Select
                    value={itemsPerPage}
                    label="Por página"
                    onChange={handleItemsPerPageChange}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
                
                {totalPages > 1 && (
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    showFirstButton 
                    showLastButton
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
      
      {purchases && purchases.length === 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma compra encontrada
          </Typography>
        </Box>
      )}
    </Container>
  )
}
