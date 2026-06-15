import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { apiFetch } from '../api';
import { ArrowLeft, Save } from 'lucide-react';

export function AdotanteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState(''); // Not returned by API
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; cpf?: string }>({});

  useEffect(() => {
    if (isEditing) {
      const fetchAdotante = async () => {
        try {
          const data = await apiFetch(`/adotantes/${id}`);
          setNome(data.nome);
          setEmail(data.email);
          setTelefone(data.telefone);
          // CPF is intentionally not returned, so user has to type it again
        } catch (err: any) {
          setError('Adotante não encontrado.');
        }
      };
      fetchAdotante();
    }
  }, [id, isEditing]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic mask: 000.000.000-00
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 9) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    setCpf(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic mask: (00) 00000-0000
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    if (val.length > 9) {
      val = val.replace(/(\d{5})(\d)/, '$1-$2');
    } else if (val.length > 8) {
      val = val.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setTelefone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const rawCpf = cpf.replace(/\D/g, '');
    const rawTelefone = telefone.replace(/\D/g, '');

    if (!nome.trim() || !email.trim() || !rawTelefone || !rawCpf) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (rawCpf.length !== 11) {
      setFieldErrors({ cpf: 'CPF deve conter 11 dígitos' });
      return;
    }

    const payload = {
      nome,
      email,
      telefone: rawTelefone,
      cpf: rawCpf,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await apiFetch(`/adotantes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/adotantes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      navigate('/adotantes');
    } catch (err: any) {
      const msg = err?.data?.message;
      if (err?.status === 400 && msg?.toLowerCase().includes('email já cadastrado')) {
        setFieldErrors({ email: msg });
      } else {
        setError(msg || 'Erro ao salvar o adotante');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/adotantes" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Adotante' : 'Novo Adotante'}
        </h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.email ? 'border-red-300 text-red-900' : 'border-gray-300'
              }`}
              placeholder="Ex: joao@email.com"
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="text"
              value={telefone}
              onChange={handlePhoneChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF * {isEditing && <span className="text-xs font-normal text-gray-500">(Necessário informar novamente)</span>}
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.cpf ? 'border-red-300 text-red-900' : 'border-gray-300'
              }`}
              placeholder="000.000.000-00"
              required
            />
            {fieldErrors.cpf && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.cpf}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Link
              to="/adotantes"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
