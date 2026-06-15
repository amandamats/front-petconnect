import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiFetch } from '../api';
import { useAuth } from '../auth';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Pet {
  id: number;
  nome: string;
  adotado: boolean;
  idade: number;
  especie: string;
  status: 'DISPONIVEL' | 'RESERVADO' | 'ADOTADO';
}

interface PageResponse {
  content: Pet[];
  totalPages: number;
  number: number;
}

export function PetsList() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (nome) query.append('nome', nome);
      if (especie) query.append('especie', especie);
      if (status) query.append('status', status);
      query.append('page', page.toString());
      
      const response = await apiFetch(`/pets?${query.toString()}`);
      setData(response);
    } catch (err: any) {
      setError(err?.data?.message || 'Erro ao carregar pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [page, nome, especie, status]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pet?')) return;
    
    try {
      await apiFetch(`/pets/${id}`, { method: 'DELETE' });
      fetchPets();
    } catch (err: any) {
      alert(err?.data?.message || 'Erro ao excluir');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disponível</span>;
      case 'RESERVADO':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Reservado</span>;
      case 'ADOTADO':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Adotado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
        {isAuthenticated && (
          <Link
            to="/pets/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Pet
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar por nome..."
            />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
          <input
            type="text"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: Cachorro, Gato"
          />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
          >
            <option value="">Todos</option>
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADO">Reservado</option>
            <option value="ADOTADO">Adotado</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : !data?.content.length ? (
          <div className="p-8 text-center text-gray-500">Nenhum pet encontrado.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.content.map((pet) => (
              <li key={pet.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{pet.nome}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(pet.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {pet.especie}
                          {pet.idade ? ` • ${pet.idade} anos` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="ml-4 flex items-center gap-2">
                      <Link
                        to={`/pets/${pet.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(pet.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-md sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
              disabled={page === data.totalPages - 1}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{data.number + 1}</span> de <span className="font-medium">{data.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {Array.from({ length: data.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                      i === page
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
