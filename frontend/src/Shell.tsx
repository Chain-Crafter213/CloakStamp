import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './fragments/layout/AppShell';
import { Spinner } from './fragments/shared';

const HomeView = lazy(() => import('./views/HomeView'));
const CertifyView = lazy(() => import('./views/CertifyView'));
const MyDocumentsView = lazy(() => import('./views/MyDocumentsView'));
const ProveView = lazy(() => import('./views/ProveView'));
const VerifyView = lazy(() => import('./views/VerifyView'));

export default function Shell() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner className="min-h-screen" />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomeView />} />
            <Route path="/certify" element={<CertifyView />} />
            <Route path="/documents" element={<MyDocumentsView />} />
            <Route path="/prove" element={<ProveView />} />
            <Route path="/verify" element={<VerifyView />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
