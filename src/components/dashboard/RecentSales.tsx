'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FiBriefcase,
  FiClock,
  FiShoppingCart,
  FiTag,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

interface Sale {
  id: number;
  student: string;
  amount: string;
  time: string;
  items: string;
  clienteType: 'ALUNO' | 'FUNCIONARIO_ESCOLA' | 'AVULSA';
  clienteRa?: number;
}

interface RecentSalesProps {
  sales: Sale[];
}

export default function RecentSales({ sales = [] }: RecentSalesProps) {
  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'ALUNO':
        return <FiUser className='w-4 h-4 text-blue-600' />;
      case 'FUNCIONARIO_ESCOLA':
        return <FiBriefcase className='w-4 h-4 text-green-600' />;
      default:
        return <FiUsers className='w-4 h-4 text-gray-600' />;
    }
  };

  const getClientTypeBadge = (type: string) => {
    switch (type) {
      case 'ALUNO':
        return (
          <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium'>
            Aluno
          </span>
        );
      case 'FUNCIONARIO_ESCOLA':
        return (
          <span className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
            Funcionário
          </span>
        );
      default:
        return (
          <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium'>
            Avulso
          </span>
        );
    }
  };

  return (
    <Card className='shadow-lg border-0 h-full'>
      <CardHeader className='bg-gradient-to-r from-[#253287] to-[#1a237e] text-white rounded-t-lg'>
        <CardTitle className='flex items-center justify-between text-white'>
          <div className='flex items-center'>
            <FiShoppingCart className='w-5 h-5 mr-2' />
            Vendas Recentes
          </div>
          <span className='bg-white/20 px-3 py-1 rounded-full text-sm font-medium'>
            {sales.length} hoje
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='space-y-4 max-h-96 overflow-y-auto'>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div
                key={sale.id}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200'
              >
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-[#253287] to-[#3949ab] rounded-full flex items-center justify-center shadow-md'>
                    {getClientTypeIcon(sale.clienteType)}
                    {sale.clienteType === 'ALUNO' && (
                      <span className='text-white font-semibold text-sm'>
                        {sale.student.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='font-semibold text-gray-900 text-sm'>{sale.student}</p>
                      {getClientTypeBadge(sale.clienteType)}
                    </div>
                    <p className='text-sm text-gray-600 flex items-center'>
                      <FiTag className='w-3 h-3 mr-1' />
                      {sale.items}
                      {sale.clienteType === 'ALUNO' && sale.clienteRa && (
                        <span className='ml-2 text-xs text-gray-500'>RA: {sale.clienteRa}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-[#253287] text-lg mb-1'>{sale.amount}</p>
                  <p className='text-sm text-gray-500 flex items-center justify-end'>
                    <FiClock className='w-3 h-3 mr-1' />
                    {sale.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center text-gray-500 py-12'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiShoppingCart className='w-10 h-10 text-gray-400' />
              </div>
              <p className='font-medium text-lg mb-2'>Nenhuma venda registrada hoje</p>
              <p className='text-sm text-gray-400'>As vendas aparecerão aqui quando realizadas</p>
            </div>
          )}
        </div>

        {sales.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <a
              href='/dashboard/relatorios'
              className='inline-flex items-center text-[#253287] hover:text-[#1a237e] font-semibold text-sm transition-colors duration-200 group'
            >
              Ver todas as vendas
              <FiTrendingUp className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
