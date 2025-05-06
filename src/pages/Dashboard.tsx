
import React from "react";
import { useAppContext } from "@/context/AppContext";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Layers, CheckSquare, AlertTriangle, RefreshCw } from "lucide-react";

import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';

const Dashboard: React.FC = () => {
  const { projects, panels, projectSummary, panelSummary } = useAppContext();

  // Prepare data for pie chart
  const pieChartData = panelSummary.statusCounts.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count
  }));

  // Colors for pie chart - updated for Volta theme
  const COLORS = [
    '#4B8BDF', // manufactured - blue
    '#FF9F5A', // delivered - orange
    '#FFD166', // installed - yellow
    '#4BD763', // inspected - green
    '#F5515F'  // rejected - red
  ];

  // Prepare data for bar chart
  const barChartData = projects.slice(0, 5).map(project => ({
    name: project.name.split(' ').slice(0, 2).join(' '), // Trim long names
    panels: panels.filter(p => p.projectId === project.id).length
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70 text-sm">Panel tracking and project overview</p>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <RefreshCw className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Projects" 
          value={projectSummary.totalProjects} 
          icon={<Building className="h-4 w-4" />}
          description="All projects in the system"
          className="bg-volta-card border-volta-border text-white"
        />
        <StatsCard 
          title="Active Projects" 
          value={projectSummary.activeProjects}
          icon={<Building className="h-4 w-4" />}
          description="Currently ongoing projects"
          trend={{ value: 12, positive: true }}
          className="bg-volta-card border-volta-border text-white"
        />
        <StatsCard 
          title="Total Panels" 
          value={panelSummary.totalPanels}
          icon={<Layers className="h-4 w-4" />}
          description="All panels across projects"
          trend={{ value: 8, positive: true }}
          className="bg-volta-card border-volta-border text-white"
        />
        <StatsCard 
          title="Installed Panels" 
          value={panelSummary.statusCounts.find(s => s.status === 'installed')?.count || 0}
          icon={<CheckSquare className="h-4 w-4" />}
          description="Panels successfully installed"
          trend={{ value: 5, positive: true }}
          className="bg-volta-card border-volta-border text-white"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart for panel statuses */}
        <Card className="bg-volta-card border-volta-border text-white">
          <CardHeader className="border-b border-volta-border pb-3">
            <CardTitle className="text-lg text-white">Panel Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#8F2D3B', borderColor: '#7A2836', color: 'white' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart for projects */}
        <Card className="bg-volta-card border-volta-border text-white">
          <CardHeader className="border-b border-volta-border pb-3">
            <CardTitle className="text-lg text-white">Panels by Project</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#7A2836" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                  tick={{fontSize: 12, fill: 'white'}}
                />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip contentStyle={{ backgroundColor: '#8F2D3B', borderColor: '#7A2836', color: 'white' }} />
                <Legend />
                <Bar dataKey="panels" name="Panel Count" fill="#4B8BDF" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent projects */}
      <Card className="mb-6 bg-volta-card border-volta-border text-white">
        <CardHeader className="border-b border-volta-border pb-3">
          <CardTitle className="text-lg text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-volta-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Panels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-volta-border">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-volta-secondary/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{project.name}</div>
                      <div className="text-white/60 text-xs">{project.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {panels.filter(panel => panel.projectId === project.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Panels requiring attention */}
      <Card className="bg-volta-card border-volta-border text-white">
        <CardHeader className="border-b border-volta-border pb-3">
          <CardTitle className="text-lg flex items-center text-white">
            <AlertTriangle className="h-4 w-4 mr-2 text-volta-chart-red" />
            Panels Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-volta-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Serial No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-volta-border">
                {panels
                  .filter(panel => panel.status === 'rejected')
                  .slice(0, 5)
                  .map((panel) => {
                    const project = projects.find(p => p.id === panel.projectId);
                    return (
                      <tr key={panel.id} className="hover:bg-volta-secondary/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{panel.serialNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{panel.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {project?.name || 'Unknown Project'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={panel.status} pulse={true} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/80">
                          {panel.inspectedDate || panel.installedDate || panel.deliveredDate || panel.manufacturedDate}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
