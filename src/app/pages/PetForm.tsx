import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { apiFetch } from '../api';
import { ArrowLeft, Save } from 'lucide-react';

export function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [idade, setIdade] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchPet = async () => {
        try {
          const data = await apiFetch(`/pets/${id}`);
          setNome(data.nome);
          setEspecie(data.especie);
          setIdade(data.idade || '');
        } catch (err: any) {
          setError('Pet não encontrado.');
        }
      };
      fetchPet();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation mirroring backend rules
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!especie.trim()) {
      setError('Espécie é obrigatória');
      return;
    }
    if (idade !== '' && Number(idade) <= 0) {
      setError('A idade deve ser maior que zero');
      return;
    }

    const payload = {
      nome,
      especie,
      ...(idade !== '' ? { idade: Number(idade) } : {})
    };

    setLoading(true);
    try {
      if (isEditing) {
        await apiFetch(`/pets/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/pets', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      navigate('/pets');
    } catch (err: any) {
      setError(err?.data?.message || 'Erro ao salvar o pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pets" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Pet' : 'Novo Pet'}
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
              placeholder="Ex: Rex"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espécie *
            </label>
            <input
              type="text"
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Cachorro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idade
            </label>
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value === '' ? '' : Number(e.target.value))}
              min="1"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Idade em anos (opcional)"
            />
            <p className="mt-1 text-sm text-gray-500">Se informada, deve ser maior que zero.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Link
              to="/pets"
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
