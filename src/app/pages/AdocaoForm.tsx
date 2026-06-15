import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { apiFetch } from '../api';
import { ArrowLeft, HeartHandshake } from 'lucide-react';

interface Pet {
  id: number;
  nome: string;
  especie: string;
}

interface Adotante {
  id: number;
  nome: string;
}

export function AdocaoForm() {
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [adotantes, setAdotantes] = useState<Adotante[]>([]);
  
  const [petId, setPetId] = useState<string>('');
  const [adotanteId, setAdotanteId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        // Only fetch available pets. Let's ask for a lot of items so we get them in one page.
        const [petsRes, adotantesRes] = await Promise.all([
          apiFetch('/pets?status=DISPONIVEL&size=100'),
          apiFetch('/adotantes')
        ]);
        
        setPets(petsRes.content || []);
        setAdotantes(adotantesRes || []);
      } catch (err: any) {
        setError('Erro ao carregar dados para o formulário.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!petId || !adotanteId) {
      setError('Por favor, selecione um pet e um adotante.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/adocoes', {
        method: 'POST',
        body: JSON.stringify({
          petId: Number(petId),
          adotanteId: Number(adotanteId)
        }),
      });
      navigate('/adocoes');
    } catch (err: any) {
      if (err?.status === 500) {
        setError('Não foi possível concluir a operação, tente novamente mais tarde.');
      } else {
        setError(err?.data?.message || 'Erro ao criar adoção');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/adocoes" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Nova Adoção
        </h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="py-8 text-center text-gray-500">Carregando informações...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Disponível *
              </label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Selecione um pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nome} ({pet.especie})
                  </option>
                ))}
              </select>
              {pets.length === 0 && (
                <p className="mt-1 text-sm text-red-500">Não há pets disponíveis no momento.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adotante *
              </label>
              <select
                value={adotanteId}
                onChange={(e) => setAdotanteId(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Selecione um adotante</option>
                {adotantes.map((adotante) => (
                  <option key={adotante.id} value={adotante.id}>
                    {adotante.nome}
                  </option>
                ))}
              </select>
              {adotantes.length === 0 && (
                <p className="mt-1 text-sm text-red-500">Não há adotantes cadastrados no momento.</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Link
                to="/adocoes"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || pets.length === 0 || adotantes.length === 0}
                className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <HeartHandshake className="w-4 h-4" />
                {loading ? 'Criando...' : 'Criar Adoção'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
