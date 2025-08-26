import React, { useEffect } from 'react';
import Stepper from './Stepper';
import RequisitionForm from './RequisitionForm';
import CotizacionForm from './CotizacionForm';
import GenerarOrdenForm from './GenerarOrdenForm';
import Card from '../ui/Card';
import { useOrderFormStore } from '../../stores/orderFormStore';

export default function NewOrderWizard() {
  console.log('--- Rendering NewOrderWizard ---');
  const currentStep = useOrderFormStore((state) => state.data.currentStep);
  const { reset } = useOrderFormStore.getState();

  // CAMBIO: Lógica simplificada y correcta, como usted sugirió.
  useEffect(() => {
    console.log('[NewOrderWizard useEffect] Running effect ONCE.');
    const store = useOrderFormStore.getState();
    // Si entramos a esta página y el estado persistido era de una edición,
    // reseteamos todo para garantizar un formulario limpio.
    if (store.data.formContext.type === 'edit') {
      console.log('[NewOrderWizard useEffect] Context was "edit". Resetting form completely.');
      reset();
    }
  }, []); // El array vacío es crucial para que solo se ejecute al montar.

  const handleNextStep = () => useOrderFormStore.getState().setData({ currentStep: currentStep + 1 });
  const handlePrevStep = () => useOrderFormStore.getState().setData({ currentStep: currentStep - 1 });

  const stepTitles = {
    1: { title: "Paso 1: Requisición", subtitle: "Formalización de la necesidad." },
    2: { title: "Paso 2: Cotización", subtitle: "Registro de la oferta del proveedor." },
    3: { title: "Paso 3: Generación de la Orden", subtitle: "Asociar punto de cuenta y finalizar." },
  };

  // Protección para el renderizado inicial antes de que el efecto se complete.
  const safeCurrentStep = currentStep || 1;
  const currentTitle = stepTitles[safeCurrentStep as keyof typeof stepTitles] || { title: '', subtitle: ''};
  
  console.log(`[NewOrderWizard] Rendering step: ${safeCurrentStep}`);

  return (
    <div>
      <Stepper currentStep={safeCurrentStep} />
      <div className="mt-8">
        <Card title={currentTitle.title} subtitle={currentTitle.subtitle}>
          {safeCurrentStep === 1 && <RequisitionForm onNextStep={handleNextStep} />}
          {safeCurrentStep === 2 && <CotizacionForm onNextStep={handleNextStep} onPrevStep={handlePrevStep} />}
          {safeCurrentStep === 3 && <GenerarOrdenForm onPrevStep={handlePrevStep} />}
        </Card>
      </div>
    </div>
  );
}