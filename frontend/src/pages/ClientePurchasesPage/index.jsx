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
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import { useSnackbar } from 'notistack';

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
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPurchases();
  }, [changeState, currentPage, itemsPerPage, initialDate, finalDate, statusFilter]);

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
    setIsLoading(true);
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
      
      const response = await axios.get(url);
      const result = response.data;
      
      // Verificar se o resultado é um array ou um objeto
      let purchasesData, totalPagesData, totalItemsData;
      
      if (Array.isArray(result)) {
        // Se é um array, usar diretamente
        purchasesData = result;
        totalPagesData = 1;
        totalItemsData = result.length;
      } else {
        // Se é um objeto, extrair as propriedades
        purchasesData = result.purchases || [];
        totalPagesData = result.totalPages || 1;
        totalItemsData = result.total || 0;
      }
      
      setPurchases(purchasesData);
      setTotalPages(totalPagesData);
      setTotalItems(totalItemsData);
      setPurchase({});
      
      // Não mostrar notificação de sucesso para carregamento de dados
      // Apenas mostrar notificações para ações do usuário
    } catch (error) {
      setPurchases([]);
      enqueueSnackbar('Erro ao carregar compras', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  function clearFilters() {
    setInitialDate('');
    setFinalDate('');
    setStatusFilter('all');
  }

  function handleDeleteClick(purchase) {
    setPurchaseToDelete(purchase);
    setDeleteDialogOpen(true);
  }

  function handleDeleteCancel() {
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!purchaseToDelete) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_URL}/purchases/${purchaseToDelete.id}/delete`);
      enqueueSnackbar("Registro removido com sucesso!", { variant: 'success' });
      
      // Atualizar o estado local imediatamente
      setPurchases(prevPurchases => 
        prevPurchases.filter(purchase => purchase.id !== purchaseToDelete.id)
      );
      
      // Também incrementar o changeState para garantir que os dados sejam recarregados
      setChangeState(prev => prev + 1);
    } catch (error) {
      enqueueSnackbar("Erro ao remover registro", { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  }

  async function markPurchaseAsCompleted(purchaseId) {
    try {
      await axios.put(`${import.meta.env.VITE_URL}/purchases/${purchaseId}/complete`);
      enqueueSnackbar("Compra marcada como concluída!", { variant: 'success' });
      
      // Atualizar o estado local imediatamente
      setPurchases(prevPurchases => 
        prevPurchases.map(purchase => 
          purchase.id === purchaseId 
            ? { ...purchase, status: "CONCLUIDO", wasPaid: true }
            : purchase
        )
      );
      
      // Também incrementar o changeState para garantir que os dados sejam recarregados
      setChangeState(prev => prev + 1);
    } catch (error) {
      enqueueSnackbar("Erro ao marcar compra como concluída", { variant: 'error' });
    }
  }

  function calculatePurchaseValue(purchase) {
    
    if (purchase.valorTotal) {
      return purchase.valorTotal;
    }
    
    // Se tem array de valores, somar todos
    if (purchase.valor && Array.isArray(purchase.valor) && purchase.valor.length > 0) {
      const total = purchase.valor.reduce((sum, val) => sum + (val || 0), 0);
      return total;
    }
    
    if (purchase.produtos && Array.isArray(purchase.produtos) && purchase.produtos.length > 0) {
      const total = purchase.produtos.reduce((sum, produto) => {
        return sum + ((produto.price || 0) * (produto.quantity || 0));
      }, 0);
 
      return total;
    }
    
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
      
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Carregando compras...
          </Typography>
        </Box>
      ) : purchases && purchases.length > 0 ? (
         <Box sx={{ width: '100%' }}>
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
                              color="success"
                              onClick={() => markPurchaseAsCompleted(purchase.id)}
                              title="Alterar Status para Concluído"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(purchase)}
                            title="Excluir compra"
                          >
                            <DeleteIcon />
                          </IconButton>
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
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Nenhuma compra encontrada
          </Typography>
        </Box>
      )}
      
      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir a compra <strong>#{purchaseToDelete?.id}</strong>?
            <br />
            <br />
            <strong>Data:</strong> {purchaseToDelete ? new Date(purchaseToDelete.createdAt).toLocaleDateString('pt-br') : ''}
            <br />
            <strong>Valor:</strong> {purchaseToDelete ? calculatePurchaseValue(purchaseToDelete).toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL'
            }) : ''}
            <br />
            <strong>Status:</strong> {purchaseToDelete ? getStatus(purchaseToDelete) : ''}
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      
    </Container>
  )
}
