import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NuevaPostulacion from './components/NuevaPostulacion';
import CVBuilder from './components/CVBuilder';
import CVViewer from './components/CVViewer';
import DetallePostulacion from './components/DetallePostulacion';
import EditarPostulacion from './components/EditarPostulacion';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="nueva" element={<NuevaPostulacion />} />
          <Route path="cv-builder" element={<CVBuilder />} />
          <Route path="cv/:id" element={<CVViewer />} />
          <Route path="detalle/:id" element={<DetallePostulacion />} />
          <Route path="editar/:id" element={<EditarPostulacion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
