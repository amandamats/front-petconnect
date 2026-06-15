import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiFetch } from '../api';
import { Check, X, Plus } from 'lucide-react';

interface Adocao {
  id: number;
  petId: number;
  nomePet: string;
  adotanteId: number;
  nomeAdotante: string;
  dataAdocao: string;
  status: 'PENDENTE' | 'APROVADA' | 'CANCELADA';
}

export function AdocoesList() {
  const [data, setData] = useState<Adocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdocoes = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/adocoes');
      setData(response || []);
    } catch (err: any) {
      setError(err?.data?.message || 'Erro ao carregar adoções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdocoes();
  }, []);

  const handleAction = async (id: number, action: 'aprovar' | 'cancelar') => {
    if (!confirm(`Tem certeza que deseja ${action} esta adoção?`)) return;
    
    try {
      await apiFetch(`/adocoes/${id}/${action}`, { method: 'PUT' });
      fetchAdocoes();
    } catch (err: any) {
      alert(err?.data?.message || 'Erro ao realizar operação');
    }
  };

  const pendentes = data.filter((a) => a.status === 'PENDENTE');
  const historico = data.filter((a) => a.status !== 'PENDENTE');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>;
      case 'APROVADA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aprovada</span>;
      case 'CANCELADA':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Adoções</h1>
        <Link
          to="/adocoes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Adoção
        </Link>
      </div>

      {loading && <div className="text-center text-gray-500 py-8">Carregando...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}

      {!loading && !error && (
        <>
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pendentes de Aprovação</h2>
            {pendentes.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
                Nenhuma adoção pendente.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendentes.map((adocao) => (
                  <div key={adocao.id} className="bg-white p-5 rounded-lg border border-yellow-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-gray-500">ID: {adocao.id}</span>
                        {getStatusBadge(adocao.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Pet</p>
                      <p className="font-medium text-gray-900 mb-3">{adocao.nomePet}</p>
                      <p className="text-sm text-gray-600 mb-1">Adotante</p>
                      <p className="font-medium text-gray-900 mb-4">{adocao.nomeAdotante}</p>
                      <p className="text-xs text-gray-400 mb-6">
                        Data: {new Date(adocao.dataAdocao).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleAction(adocao.id, 'aprovar')}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" /> Aprovar
                      </button>
                      <button
                        onClick={() => handleAction(adocao.id, 'cancelar')}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 py-2 px-3 rounded-md text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Histórico</h2>
            {historico.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
                Nenhum histórico de adoção.
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adotante</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historico.map((adocao) => (
                        <tr key={adocao.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(adocao.dataAdocao).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {adocao.nomePet}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {adocao.nomeAdotante}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(adocao.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
