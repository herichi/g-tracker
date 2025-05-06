
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-construction-blue-light to-construction-blue-dark">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-construction-blue-dark">Qatar Panels</h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive panel management system for construction projects
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="mr-2" />
              Sign In
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Project Management</h3>
              <p className="text-gray-600">Track all your construction projects in one place</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Panel Tracking</h3>
              <p className="text-gray-600">Monitor panel manufacturing, delivery and installation</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">Ensure all panels meet your quality standards</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2025 Doha Extraco. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
