import React, { useState } from 'react';
import Stepper from './Stepper';
import RequisitionForm from './RequisitionForm';
import CotizacionForm from './CotizacionForm';
import GenerarOrdenForm from './GenerarOrdenForm';
import Card from '../ui/Card';

export default function NewOrderWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => setCurrentStep(prev => prev + 1);
  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  const stepTitles = {
    1: { title: "Paso 1: Requisición", subtitle: "Formalización de la necesidad." },
    2: { title: "Paso 2: Cotización", subtitle: "Registro de la oferta del proveedor." },
    3: { title: "Paso 3: Generación de la Orden", subtitle: "Asociar punto de cuenta y finalizar." },
  };

  const currentTitle = stepTitles[currentStep as keyof typeof stepTitles] || { title: '', subtitle: ''};

  return (
    <div>
      <Stepper currentStep={currentStep} />
      <div className="mt-8">
        <Card title={currentTitle.title} subtitle={currentTitle.subtitle}>
          {currentStep === 1 && <RequisitionForm onNextStep={handleNextStep} />}
          {currentStep === 2 && <CotizacionForm onNextStep={handleNextStep} onPrevStep={handlePrevStep} />}
          {currentStep === 3 && <GenerarOrdenForm onPrevStep={handlePrevStep} />}
        </Card>
      </div>
    </div>
  );
}