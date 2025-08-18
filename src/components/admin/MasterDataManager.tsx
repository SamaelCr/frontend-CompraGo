import React, { useState } from 'react';
import type { Unit, Position, Official } from '../../utils/api';
import UnitsManager from './managers/UnitsManager';
import PositionsManager from './managers/PositionsManager';
import OfficialsManager from './managers/OfficialsManager';

interface MasterDataManagerProps {
    initialData: {
        units: Unit[];
        positions: Position[];
        officials: Official[];
    };
}

export default function MasterDataManager({ initialData }: MasterDataManagerProps) {
    const [activeTab, setActiveTab] = useState('officials');
    
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
                {activeTab === 'officials' && (
                    <OfficialsManager 
                        initialOfficials={initialData.officials} 
                        units={initialData.units} 
                        positions={initialData.positions} 
                    />
                )}
                {activeTab === 'units' && <UnitsManager initialUnits={initialData.units} />}
                {activeTab === 'positions' && <PositionsManager initialPositions={initialData.positions} />}
            </div>
        </div>
    );
}