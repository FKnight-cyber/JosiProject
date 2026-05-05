import { Container } from "./style";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Divider,
  Pagination,
  Stack,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Add, AttachMoney, Inventory, TrendingUp, CalendarToday } from "@mui/icons-material";
import { useSnackbar } from 'notistack';

export default function ClienteTransactions() {

  const [cliente, setCliente] = useState();
  const [initialDate, setInitialDate] = useState(null);
  const [finalDate, setFinalDate] = useState(null);
  const [transactions, setTransactions] = useState();
  const [adiantamentos, setAdiantamentos] = useState();
  const [allAdiantamentos, setAllAdiantamentos] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAdiantamentos, setTotalAdiantamentos] = useState(0);
  /** null = ainda carregando; 'error' = falha ao buscar /all (evita exibir R$ 0,00 enganoso) */
  const [allAdiantamentosStatus, setAllAdiantamentosStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
 
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/${id}`);

    promise.then(res => {
      setCliente(res.data);
    });

    fetchAllAdiantamentos();
    
    fetchAdiantamentos(1);
  }, [id]);

  function parseValorAdiantamento(valor) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  function fetchAllAdiantamentos() {
    const url = `${import.meta.env.VITE_URL}/advances/client/${id}/all`;
    setAllAdiantamentosStatus('loading');

    axios
      .get(url)
      .then((res) => {
        const raw = res.data;
        const lista = Array.isArray(raw) ? raw : Array.isArray(raw?.adiantamentos) ? raw.adiantamentos : [];
        setAllAdiantamentos(lista);
        setAllAdiantamentosStatus('ok');
      })
      .catch((error) => {
        console.error('Erro ao buscar todos os adiantamentos:', error);
        setAllAdiantamentosStatus('error');
        enqueueSnackbar('Não foi possível calcular o total de adiantamentos. Tente atualizar a página.', {
          variant: 'warning',
        });
      });
  }

  function fetchAdiantamentos(page) {
    setIsLoading(true);
    const url = `${import.meta.env.VITE_URL}/advances/client/${id}?page=${page}&limit=5`;
    
    const promise = axios.get(url);

    promise.then(res => {
      setAdiantamentos(res.data.adiantamentos || res.data);
      setTotalPages(res.data.totalPages || 0);
      setTotalAdiantamentos(res.data.total || res.data.length || 0);
      setCurrentPage(res.data.currentPage || page);
      
      // Não mostrar notificação de sucesso para carregamento de dados
      // Apenas mostrar notificações para ações do usuário
    }).catch(error => {
      console.error('Erro ao buscar adiantamentos paginados:', error);
      enqueueSnackbar('Erro ao carregar adiantamentos', { variant: 'error' });
    }).finally(() => {
      setIsLoading(false);
    });
  }

  function handlePageChange(event, newPage) {
    setCurrentPage(newPage);
    fetchAdiantamentos(newPage);
  }

  function filterByDate(event) {
    event.preventDefault();
    
    if (!initialDate || !finalDate) {
      enqueueSnackbar('Por favor, selecione as datas inicial e final', { variant: 'warning' });
      return;
    }

    setIsLoadingTransactions(true);

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const initialDateFormatted = formatDate(initialDate);
    const finalDateFormatted = formatDate(finalDate);

    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/${id}/transactions?initial=${initialDateFormatted}&final=${finalDateFormatted}`);

    promise.then(res => {
      setTransactions(res.data);
      enqueueSnackbar('Transações carregadas com sucesso!', { variant: 'success' });
    }).catch(error => {
      enqueueSnackbar('Erro ao carregar transações', { variant: 'error' });
    }).finally(() => {
      setIsLoadingTransactions(false);
    });
  }

  function renderTransactions() {
    if (isLoadingTransactions) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Carregando transações...
          </Typography>
        </Box>
      );
    }

    if (!transactions || Object.keys(transactions).length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Nenhuma transação encontrada para o período selecionado
        </Typography>
      );
    }

    const transactionItems = [];
    let totalItems = 0;

    for(const transaction in transactions) {
      const quantity = transactions[transaction];
      totalItems += quantity;
      
      const parts = transaction.split(' ');
      const unit = parts.pop();
      const productName = parts.join(' ');
      
      transactionItems.push({
        name: productName,
        unit: unit,
        quantity: quantity,
        fullName: transaction
      });
    }

    // Ordenar por quantidade (maior para menor)
    transactionItems.sort((a, b) => b.quantity - a.quantity);

    return (
      <Box>
        {/* Header com resumo */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                <Typography variant="h6">
                  Resumo do Período
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory />
                <Typography variant="h6">
                  {totalItems.toLocaleString('pt-BR')} itens
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Lista de transações */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          {transactionItems.map((item, index) => {
            // Destacar os 3 primeiros produtos (maiores quantidades)
            const isTopProduct = index < 3;
            
            return (
              <Card key={item.fullName} sx={{ 
                border: '1px solid',
                borderColor: isTopProduct ? 'primary.main' : 'grey.200',
                bgcolor: isTopProduct ? 'primary.50' : 'white',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2
                }
              }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Número de ordem */}
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        bgcolor: isTopProduct ? 'primary.main' : 'grey.500', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </Box>
                      
                      {/* Informações do produto */}
                      <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unidade: {item.unit}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Quantidade */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" component="div" sx={{ 
                        fontWeight: 'bold', 
                        color: isTopProduct ? 'primary.main' : 'text.primary' 
                      }}>
                        {item.quantity.toLocaleString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.unit}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Footer com estatísticas */}
        <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total de produtos diferentes: {transactionItems.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Período: {initialDate?.toLocaleDateString('pt-BR')} a {finalDate?.toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  function renderAdiantamentos() {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Carregando adiantamentos...
          </Typography>
        </Box>
      );
    }

    if (!adiantamentos || adiantamentos.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Nenhum adiantamento registrado
        </Typography>
      );
    }

    return (
      <>
        {adiantamentos.map((adiantamento) => {
          const valorNum = parseValorAdiantamento(adiantamento.valor);
          const isDeducao = valorNum < 0;

          return (
          <Card key={adiantamento.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: isDeducao ? 'error.main' : 'text.primary' }}
                  >
                    R$ {valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(adiantamento.dataAdiantamento).toLocaleDateString('pt-BR')}
                  </Typography>
                  {adiantamento.descricao && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {adiantamento.descricao}
                    </Typography>
                  )}
                </Box>
                <Chip 
                  icon={<AttachMoney />} 
                  label={isDeducao ? 'Dedução' : 'Adiantamento'} 
                  color={isDeducao ? 'error' : 'primary'} 
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        );
        })}
        
        {/* Paginação dos adiantamentos */}
        {totalPages > 1 && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Página {currentPage} de {totalPages} • Total de {totalAdiantamentos} adiantamentos
            </Typography>
            
            <Stack spacing={2} alignItems="center">
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Stack>
          </Box>
        )}
      </>
    );
  }

  function calcularTotalAdiantamentos() {
    if (allAdiantamentosStatus === 'loading' || allAdiantamentosStatus === null) return null;
    if (allAdiantamentosStatus === 'error') return null;
    if (!Array.isArray(allAdiantamentos)) return 0;
    return allAdiantamentos.reduce((total, adiantamento) => total + parseValorAdiantamento(adiantamento.valor), 0);
  }

  const totalAdiantamentosValor = calcularTotalAdiantamentos();
  const exibirTotalNegativoEmVermelho = typeof totalAdiantamentosValor === 'number' && totalAdiantamentosValor < 0;

  return(
   <Container>
    <div className="voltar" onClick={() => navigate(-1)}>
        <IoArrowBackCircleSharp color="crimson" size={60} />
    </div>
    
    {/* Header com título melhorado */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Histórico de Transações
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Fornecedor: {cliente ? cliente.name : ""}
      </Typography>
    </Box>

    {/* Seção de Adiantamentos */}
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Adiantamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/adiantamento/${id}`)}
        >
          Realizar Adiantamento
        </Button>
      </Box>
      
      <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'white' }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              color: exibirTotalNegativoEmVermelho ? 'error.main' : 'inherit',
            }}
          >
            Total de Adiantamentos:{' '}
            {allAdiantamentosStatus === 'error' ? (
              <Box component="span" sx={{ opacity: 0.9 }}>indisponível</Box>
            ) : totalAdiantamentosValor === null ? (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <CircularProgress size={22} sx={{ color: 'inherit' }} />
              </Box>
            ) : (
              `R$ ${totalAdiantamentosValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            )}
          </Typography>
        </CardContent>
      </Card>

      {renderAdiantamentos()}
    </Box>

    <Divider sx={{ my: 4 }} />

    {/* Seção de Transações com Filtros */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Transações por Período
      </Typography>
      
      {/* Filtros de Data */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box component="form" onSubmit={filterByDate} sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <DatePicker
            label="Data Inicial"
            value={initialDate}
            onChange={(newValue) => setInitialDate(newValue)}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 }
              }
            }}
          />
          
          <DatePicker
            label="Data Final"
            value={finalDate}
            onChange={(newValue) => setFinalDate(newValue)}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 }
              }
            }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            size="small"
            disabled={!initialDate || !finalDate}
          >
            Filtrar Transações
          </Button>
        </Box>
      </LocalizationProvider>
    </Box>

    {/* Lista de Transações */}
    <div className="transactions">
      {
        transactions ? renderTransactions() : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Selecione um período para visualizar as transações
          </Typography>
        )
      }
    </div>
   </Container>
  )
}