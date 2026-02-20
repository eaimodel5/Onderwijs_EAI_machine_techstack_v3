import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccessDenied = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
    <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
    <h1 className="text-4xl font-bold mb-2">Toegang Geweigerd</h1>
    <p className="text-xl text-gray-600 mb-6">
      Je hebt geen toestemming om deze pagina te bekijken.
    </p>
    <Link to="/">
      <Button>Terug naar de Chat</Button>
    </Link>
  </div>
);

export default AccessDenied;
