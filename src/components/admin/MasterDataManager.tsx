import React, { useState, useEffect, useCallback } from 'react';
import { useMasterDataStore } from '../../stores/masterDataStore';
import UnitsManager from './managers/UnitsManager';
import PositionsManager from './managers/PositionsManager';
import OfficialsManager from './managers/OfficialsManager';
import Alert from '../ui/Alert'; // CAMBIO: Importa el nuevo Alert.tsx

export default function MasterDataManager() {
    const [activeTab, setActiveTab] = useState('officials');
    
    const loadingUnits = useMasterDataStore(state => state.loading.units);
    const loadingPositions = useMasterDataStore(state => state.loading.positions);
    const loadingOfficials = useMasterDataStore(state => state.loading.officials);
    const errorUnits = useMasterDataStore(state => state.error.units);
    const errorPositions = useMasterDataStore(state => state.error.positions);
    const errorOfficials = useMasterDataStore(state => state.error.officials);

    const { fetchUnits, fetchPositions, fetchOfficials } = useMasterDataStore.getState();

    const isLoading = loadingUnits || loadingPositions || loadingOfficials;
    const errorMessage = errorUnits || errorPositions || errorOfficials;

    useEffect(() => {
        fetchUnits();
        fetchPositions();
        fetchOfficials();
    }, [fetchUnits, fetchPositions, fetchOfficials]);

    const handleRetry = useCallback(() => {
        fetchUnits(true);
        fetchPositions(true);
        fetchOfficials(true);
    }, [fetchUnits, fetchPositions, fetchOfficials]);

    const tabs = [
        { id: 'officials', label: 'Funcionarios' },
        { id: 'units', label: 'Unidades' },
        { id: 'positions', label: 'Cargos' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Unidades, Cargos y Funcionarios</h1>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {errorMessage ? (
                    <div className="mt-6">
                        <Alert title="Ocurrió un error" variant="danger">
                            <p>{errorMessage}</p>
                            <div className="mt-4">
                                {/* CAMBIO: Usamos un botón HTML normal con clases de Tailwind */}
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </Alert>
                    </div>
                ) : (
                    <>
                        <div style={{ display: activeTab === 'officials' ? 'block' : 'none' }}>
                           <OfficialsManager isInitialLoading={isLoading} />
                        </div>
                        <div style={{ display: activeTab === 'units' ? 'block' : 'none' }}>
                           <UnitsManager isInitialLoading={isLoading} />
                        </div>
                        <div style={{ display: activeTab === 'positions' ? 'block' : 'none' }}>
                           <PositionsManager isInitialLoading={isLoading} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}