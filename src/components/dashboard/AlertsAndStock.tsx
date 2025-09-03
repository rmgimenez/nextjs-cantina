'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

interface Alert {
  id?: number;
  message: string;
  type: 'error' | 'warning' | 'info';
  time: string;
}

interface LowStockProduct {
  id?: number;
  name: string;
  stock: number;
  min: number;
  status: 'critical' | 'low';
}

interface AlertsAndStockProps {
  alerts: Alert[];
  lowStockProducts: LowStockProduct[];
}

export default function AlertsAndStock({
  alerts = [],
  lowStockProducts = [],
}: AlertsAndStockProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <FiAlertCircle className='w-4 h-4 text-red-500' />;
      case 'warning':
        return <FiAlertTriangle className='w-4 h-4 text-yellow-500' />;
      default:
        return <FiCheckCircle className='w-4 h-4 text-blue-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'critical' ? 'border-red-500' : 'border-yellow-500';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'critical') {
      return (
        <span className='text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700 flex items-center'>
          <FiAlertCircle className='w-3 h-3 mr-1' />
          Crítico
        </span>
      );
    }
    return (
      <span className='text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 flex items-center'>
        <FiAlertTriangle className='w-3 h-3 mr-1' />
        Baixo
      </span>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Alertas */}
      <Card className='shadow-lg border-0'>
        <CardHeader className='bg-gradient-to-r from-[#FEA800] to-[#ff8f00] text-white rounded-t-lg'>
          <CardTitle className='flex items-center justify-between text-white'>
            <div className='flex items-center'>
              <FiAlertCircle className='w-5 h-5 mr-2' />
              Alertas do Sistema
            </div>
            <span className='bg-white/20 px-3 py-1 rounded-full text-sm font-medium'>
              {alerts.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='space-y-4 max-h-80 overflow-y-auto'>
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={alert.id || index}
                  className='flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-l-4'
                  style={{
                    borderLeftColor:
                      alert.type === 'error'
                        ? '#ef4444'
                        : alert.type === 'warning'
                        ? '#f59e0b'
                        : '#3b82f6',
                  }}
                >
                  <div className='flex-shrink-0 mt-0.5'>{getAlertIcon(alert.type)}</div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900 mb-1'>{alert.message}</p>
                    <p className='text-xs text-gray-500 flex items-center'>
                      <FiClock className='w-3 h-3 mr-1' />
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500 py-8'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiShield className='w-8 h-8 text-green-600' />
                </div>
                <p className='font-medium text-green-700 text-lg mb-2'>
                  Sistema funcionando normalmente
                </p>
                <p className='text-sm text-gray-400'>Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estoque Baixo */}
      <Card className='shadow-lg border-0'>
        <CardHeader className='bg-gradient-to-r from-[#B20000] to-[#d32f2f] text-white rounded-t-lg'>
          <CardTitle className='flex items-center justify-between text-white'>
            <div className='flex items-center'>
              <FiPackage className='w-5 h-5 mr-2' />
              Estoque Baixo
            </div>
            <span className='bg-white/20 px-3 py-1 rounded-full text-sm font-medium'>
              {lowStockProducts.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='space-y-4 max-h-80 overflow-y-auto'>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className={`border-l-4 pl-4 py-4 rounded-r-lg ${
                    product.status === 'critical'
                      ? 'bg-red-50 border-l-red-500'
                      : 'bg-yellow-50 border-l-yellow-500'
                  }`}
                >
                  <div className='flex items-center justify-between mb-3'>
                    <p className='font-semibold text-gray-900 text-sm'>{product.name}</p>
                    {getStatusBadge(product.status)}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-600 flex items-center'>
                      <FiBox className='w-3 h-3 mr-1' />
                      Estoque: <span className='font-medium ml-1'>{product.stock}</span>
                      <span className='mx-2'>|</span>
                      Mínimo: <span className='font-medium ml-1'>{product.min}</span>
                    </span>
                  </div>
                  {/* Barra de progresso do estoque */}
                  <div className='mt-2'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          product.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (product.stock / Math.max(product.min * 2, 1)) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500 py-8'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiPackage className='w-8 h-8 text-green-600' />
                </div>
                <p className='font-medium text-green-700 text-lg mb-2'>Estoque adequado</p>
                <p className='text-sm text-gray-400'>Todos os produtos com estoque adequado</p>
              </div>
            )}
          </div>
          {lowStockProducts.length > 0 && (
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <a
                href='/dashboard/estoque'
                className='inline-flex items-center text-[#B20000] hover:text-[#a00000] font-semibold text-sm transition-colors duration-200 group'
              >
                Ver estoque completo
                <FiTrendingUp className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
