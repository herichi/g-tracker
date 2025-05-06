import React from "react";
import { useAppContext } from "@/context/AppContext";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Building, Layers, CheckSquare, AlertTriangle } from "lucide-react";

import { PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { projects, panels, projectSummary, panelSummary } = useAppContext();

  // Prepare data for pie chart
  const pieChartData = panelSummary.statusCounts.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count
  }));

  // Colors for pie chart
  const COLORS = [
    '#2196F3', // manufactured - blue
    '#FF9800', // delivered - orange
    '#FFC107', // installed - yellow
    '#4CAF50', // inspected - green
    '#F44336'  // rejected - red
  ];

  // Prepare data for bar chart
  const barChartData = projects.slice(0, 5).map(project => ({
    name: project.name.split(' ').slice(0, 2).join(' '), // Trim long names
    panels: panels.filter(p => p.projectId === project.id).length
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Projects" 
          value={projectSummary.totalProjects} 
          icon={<Building className="h-4 w-4" />}
          description="All projects in the system"
        />
        <StatsCard 
          title="Active Projects" 
          value={projectSummary.activeProjects}
          icon={<Building className="h-4 w-4" />}
          description="Currently ongoing projects"
        />
        <StatsCard 
          title="Total Panels" 
          value={panelSummary.totalPanels}
          icon={<Layers className="h-4 w-4" />}
          description="All panels across projects"
        />
        <StatsCard 
          title="Installed Panels" 
          value={panelSummary.statusCounts.find(s => s.status === 'installed')?.count || 0}
          icon={<CheckSquare className="h-4 w-4" />}
          description="Panels successfully installed"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart for panel statuses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Panel Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
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
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart for projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Panels by Project</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                  tick={{fontSize: 12}}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="panels" name="Panel Count" fill="#1976D2" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent projects */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Panels</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-gray-500 text-xs">{project.id}</div>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-construction-status-error" />
            Panels Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panels
                  .filter(panel => panel.status === 'rejected')
                  .slice(0, 5)
                  .map((panel) => {
                    const project = projects.find(p => p.id === panel.projectId);
                    return (
                      <tr key={panel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{panel.serialNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{panel.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {project?.name || 'Unknown Project'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={panel.status} pulse={true} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
