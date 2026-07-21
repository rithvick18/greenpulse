import React from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { TrafficControlView } from './components/views/TrafficControlView';
import { EnergyGridView } from './components/views/EnergyGridView';
import { InfrastructureView } from './components/views/InfrastructureView';
import { PublicSafetyView } from './components/views/PublicSafetyView';
import { IndustrialPrecisionView } from './components/views/IndustrialPrecisionView';

const DashboardContent: React.FC = () => {
  const { activeTab } = useTelemetry();

  return (
    <main className="flex-1 overflow-y-auto bg-background text-on-surface">
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'traffic' && <TrafficControlView />}
      {activeTab === 'energy' && <EnergyGridView />}
      {activeTab === 'infrastructure' && <InfrastructureView />}
      {activeTab === 'public-safety' && <PublicSafetyView />}
      {activeTab === 'industrial' && <IndustrialPrecisionView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <TelemetryProvider>
      <div className="min-h-screen flex flex-col bg-background text-on-surface font-mono selection:bg-primary selection:text-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <DashboardContent />
        </div>
        <Footer />
      </div>
    </TelemetryProvider>
  );
};

export default App;
