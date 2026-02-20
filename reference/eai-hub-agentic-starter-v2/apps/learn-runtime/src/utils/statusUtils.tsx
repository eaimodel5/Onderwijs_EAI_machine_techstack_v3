
import React from 'react';
import { AlertTriangle, CheckCircle, Server } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="text-green-500" size={20} />;
    case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
    case 'error': return <AlertTriangle className="text-red-500" size={20} />;
    default: return <Server className="text-gray-500" size={20} />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'bg-green-100 text-green-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'error': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'healthy': return 'Gezond';
    case 'warning': return 'Waarschuwing';
    case 'error': return 'Fout';
    default: return status;
  }
};
