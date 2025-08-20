import React, { useState, useEffect, useCallback } from 'react';
import { useMasterDataStore } from '../../stores/masterDataStore';
import UnitsManager from './managers/UnitsManager';
import PositionsManager from './managers/PositionsManager';
import OfficialsManager from './managers/OfficialsManager';

export default function MasterDataManager() {
    const [activeTab, setActiveTab] = useState('officials');
    
    // 1. Seleccionamos cada pieza de estado PRIMITIVO de forma individual.
    //    Esto es crucial para evitar re-renders innecesarios.
    const loadingUnits = useMasterDataStore(state => state.loading.units);
    const loadingPositions = useMasterDataStore(state => state.loading.positions);
    const loadingOfficials = useMasterDataStore(state => state.loading.officials);
    const errorUnits = useMasterDataStore(state => state.error.units);
    const errorPositions = useMasterDataStore(state => state.error.positions);
    const errorOfficials = useMasterDataStore(state => state.error.officials);

    // 2. Obtenemos las acciones, que son estables y no cambian.
    const { fetchUnits, fetchPositions, fetchOfficials } = useMasterDataStore.getState();

    // 3. Calculamos el estado derivado (loading general y error general)
    const isLoading = loadingUnits || loadingPositions || loadingOfficials;
    const errorMessage = errorUnits || errorPositions || errorOfficials;

    // 4. `useEffect` para cargar los datos. El array de dependencias es estable.
    useEffect(() => {
        fetchUnits();
        fetchPositions();
        fetchOfficials();
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
                {isLoading && <p>Cargando datos maestros...</p>}
                {errorMessage && <p className="text-red-500">Error al cargar datos: {errorMessage}</p>}
                
                {!isLoading && !errorMessage && (
                    <>
                        {activeTab === 'officials' && <OfficialsManager />}
                        {activeTab === 'units' && <UnitsManager />}
                        {activeTab === 'positions' && <PositionsManager />}
                    </>
                )}
            </div>
        </div>
    );
}