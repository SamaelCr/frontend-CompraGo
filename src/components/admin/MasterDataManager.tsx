import React, { useState } from 'react';
import type { Unit, Position, Official } from '../../utils/api';
// Aquí iría la lógica completa de un componente con pestañas para Unidades, Cargos y Funcionarios.
// Por brevedad, se muestra un esqueleto funcional y la lógica completa para "Funcionarios".

// Dummy components para las otras pestañas
const UnitsManager = () => <div className="p-4 bg-slate-50 rounded">Gestión de Unidades aquí...</div>;
const PositionsManager = () => <div className="p-4 bg-slate-50 rounded">Gestión de Cargos aquí...</div>;

// Componente principal con la lógica para Funcionarios
function OfficialsManager({ initialOfficials, units, positions }: { initialOfficials: Official[], units: Unit[], positions: Position[] }) {
    const [officials, setOfficials] = useState(initialOfficials);
    // Lógica de modal, formulario, crear, editar, desactivar para funcionarios...
    // Esta sección sería muy similar al ProviderManager, con un formulario que incluye
    // <select> para Unidades y Cargos, poblados con los props `units` y `positions`.

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Funcionarios</h2>
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                    Crear Funcionario
                </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Nombre Completo</th>
                            <th className="px-6 py-3">Unidad</th>
                            <th className="px-6 py-3">Cargo</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {officials.map(official => (
                            <tr key={official.id}>
                                <td className="px-6 py-4 font-medium text-slate-900">{official.fullName}</td>
                                <td className="px-6 py-4">{official.unit.name}</td>
                                <td className="px-6 py-4">{official.position.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${official.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {official.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="font-medium text-blue-600 hover:underline">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function MasterDataManager({ initialData }: {
    initialData: { units: Unit[], positions: Position[], officials: Official[] }
}) {
    const [activeTab, setActiveTab] = useState('officials');
    
    const tabs = [
        { id: 'officials', label: 'Funcionarios' },
        { id: 'units', label: 'Unidades' },
        { id: 'positions', label: 'Cargos' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Unidades y Funcionarios</h1>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6">
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
                {activeTab === 'officials' && <OfficialsManager initialOfficials={initialData.officials} units={initialData.units} positions={initialData.positions} />}
                {activeTab === 'units' && <UnitsManager />}
                {activeTab === 'positions' && <PositionsManager />}
            </div>
        </div>
    );
}