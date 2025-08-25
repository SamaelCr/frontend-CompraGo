import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getIvaPercentage, updateIvaPercentage } from '../../utils/api';
import Card from '../ui/Card';
import Input from '../ui/Input';

export default function SettingsManager() {
  const [iva, setIva] = useState<number | string>('');
  const [initialIva, setInitialIva] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getIvaPercentage()
      .then((data) => {
        setIva(data.ivaPercentage);
        setInitialIva(data.ivaPercentage);
      })
      .catch((err) => {
        setError('No se pudo cargar la configuración del IVA.');
        toast.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIvaValue = parseFloat(iva as string);
    if (isNaN(newIvaValue) || newIvaValue < 0 || newIvaValue > 100) {
      toast.error('Por favor, ingrese un porcentaje de IVA válido (0-100).');
      return;
    }

    setIsSaving(true);
    const updatePromise = updateIvaPercentage(newIvaValue);

    toast.promise(updatePromise, {
      pending: 'Guardando nuevo porcentaje de IVA...',
      success: '¡Porcentaje de IVA actualizado con éxito!',
      error: 'No se pudo actualizar el IVA.',
    });

    updatePromise
      .then(() => {
        setInitialIva(newIvaValue);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const isChanged = initialIva !== null && parseFloat(iva as string) !== initialIva;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuración General</h1>
      <Card
        title="Parámetros Globales"
        subtitle="Valores que afectan a todo el sistema."
      >
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded w-32 ml-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Porcentaje de IVA (%)"
              type="number"
              value={iva}
              onChange={(e) => setIva(e.target.value)}
              step="0.01"
              min="0"
              max="100"
              helperText="Este valor se usará para calcular el IVA en todas las nuevas órdenes."
              required
            />
            <div className="border-t pt-6 text-right">
              <button
                type="submit"
                disabled={!isChanged || isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}