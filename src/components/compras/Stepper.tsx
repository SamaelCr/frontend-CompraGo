import React from 'react';

interface Props {
  currentStep: number;
}

const steps = ["Requisición", "Cotización", "Generar Orden"];

export default function Stepper({ currentStep }: Props) {
  return (
    <div className="w-full py-4">
      <div className="flex">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={label}>
              <div className="flex-1">
                <div
                  className={`w-10 h-10 mx-auto rounded-full text-lg flex items-center justify-center font-semibold ${
                    isActive || isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div
                  className={`text-center mt-2 font-medium ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center">
                  <div
                    className={`w-full h-1 ${
                      isCompleted ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}