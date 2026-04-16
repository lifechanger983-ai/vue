import { useSearchParams, useNavigate } from 'react-router-dom';
import OrderForm from '../../components/clients/OrderForm';

const OrderFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const boutiqueUrl = searchParams.get('boutique') || 'test-boutique';

  const handleSuccess = (data) => {
    navigate(`/commande-confirmation?data=${encodeURIComponent(JSON.stringify(data))}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <OrderForm boutiqueUrl={boutiqueUrl} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default OrderFormPage;