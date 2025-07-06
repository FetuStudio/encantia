import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function OrderStatusPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const navButtons = [
    { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
    { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
    { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/events' },
    { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
    { icon: "https://images.encantia.lat/users2.png", name: "Usuarios", url: '/profiles' },
    { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
  ];

  // Estados con íconos y etiquetas
  const steps = [
    { key: 'received', label: 'Pedido Recibido', icon: '📩' },
    { key: 'preparing', label: 'En Preparación', icon: '🔧' },
    { key: 'packaging', label: 'Empaquetando', icon: '📦' },
    { key: 'shipped', label: 'Enviado', icon: '🚚' },
    { key: 'in_transit', label: 'En Tránsito', icon: '🛣️' },
    { key: 'out_for_delivery', label: 'En Reparto', icon: '📍' },
    { key: 'delivered', label: 'Entregado', icon: '✅' },
    { key: 'cancelled', label: 'Cancelado', icon: '❌' }
  ];

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (!error) setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const currentIndex = order ? steps.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col justify-between font-sans">
      {/* Contenido principal */}
      <div className="flex flex-col items-center px-4 py-14">
        <h1 className="text-3xl font-bold mb-8">Estado del Pedido</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 max-w-3xl w-full text-center">
          {loading ? (
            <div className="text-gray-400">Cargando información...</div>
          ) : !order ? (
            <div className="text-red-400 font-semibold">Pedido no encontrado</div>
          ) : (
            <>
              {/* Estados en fila sin líneas */}
              <div className="flex justify-between items-center mb-12">
                {steps.map((step, index) => {
                  const isActive = index === currentIndex;
                  const isCompleted = index < currentIndex;

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div
                        className={`
                          w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold
                          ${isActive ? 'bg-green-500 text-white shadow-lg' :
                            isCompleted ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'}
                        `}
                      >
                        {step.icon}
                      </div>
                      <span className={`mt-2 text-xs sm:text-sm font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mensaje cancelado solo si está cancelled */}
              {order.status === 'cancelled' ? (
                <div className="text-red-500 text-lg font-semibold flex flex-col items-center mb-4">
                  <div className="text-5xl mb-2">❌</div>
                  <span>Pedido Cancelado</span>
                </div>
              ) : (
                <>
                  {/* Estado actual */}
                  <p className="text-xl font-bold mb-3 text-green-300">
                    {steps[currentIndex]?.label || 'Estado desconocido'}
                  </p>

                  {/* Detalles */}
                  <div className="text-left text-gray-300 space-y-2 mb-6">
                    <p><strong>Número de seguimiento:</strong> <span className="font-mono">{order.id}</span></p>
                    <p><strong>Cliente:</strong> {order.customer_name || 'No disponible'}</p>
                    <p><strong>Correo:</strong> {order.email || 'No disponible'}</p>
                    <p><strong>Dirección de entrega:</strong> {order.delivery_address || 'No disponible'}</p>
                    <p><strong>Método de pago:</strong> {order.payment_method || 'No disponible'}</p>
                    <p><strong>Total:</strong> ${order.total?.toFixed(2) || '0.00'}</p>
                    <p><strong>Última actualización:</strong> {new Date(order.updated_at).toLocaleString()}</p>
                    <p><strong>Fecha estimada de entrega:</strong> {order.estimated_date ? new Date(order.estimated_date).toLocaleDateString() : 'No disponible'}</p>
                  </div>

                  {/* Productos */}
                  <div className="text-left text-gray-200">
                    <h3 className="text-lg font-semibold mb-3">Productos</h3>
                    {order.order_items && order.order_items.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {order.order_items.map(item => (
                          <li key={item.id}>
                            {item.product_name} - Cantidad: {item.quantity} - Precio: ${item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No hay productos registrados.</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navbar inferior */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max z-50">
        <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-13 w-auto" />
        {navButtons.map((button, index) => (
          <div key={index} className="relative group">
            <button onClick={() => router.push(button.url)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110">
              <img src={button.icon} alt={button.name} className="w-8 h-8" />
            </button>
            <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">{button.name}</span>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="fixed bottom-3 right-3 text-gray-500 text-xs bg-gray-900 p-2 rounded-md shadow-md z-40">
        © 2025 Encantia · CC BY-NC-ND 4.0
      </div>
    </div>
  );
}
