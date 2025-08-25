import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  IconButton,
  Alert
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import axios from 'axios';

export default function AdiantamentoPage() {
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { clientId } = useParams();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const body = {
        clientId: Number(clientId),
        valor: Number(valor),
        descricao: descricao || null
      };

      await axios.post(`${import.meta.env.VITE_URL}/advances`, body);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Erro ao registrar adiantamento:', error);
      
      if (error.response) {
        if (error.response.status === 422) {
          const errorMessages = error.response.data;
          if (Array.isArray(errorMessages)) {
            setError(errorMessages.join('\n'));
          } else {
            setError(errorMessages);
          }
        } else {
          setError(`Erro ${error.response.status}: ${error.response.data}`);
        }
      } else if (error.request) {
        setError("Erro de conexão: Não foi possível conectar ao servidor");
      } else {
        setError(`Erro: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Realizar Adiantamento
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Adiantamento registrado com sucesso! Redirecionando...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Valor (R$)"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            sx={{ mb: 3 }}
            inputProps={{
              step: "0.01",
              min: "0"
            }}
          />

          <TextField
            fullWidth
            label="Descrição (opcional)"
            multiline
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Descreva o motivo do adiantamento..."
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading || !valor}
            >
              {loading ? 'Registrando...' : 'Registrar Adiantamento'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 