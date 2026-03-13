import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="border-t border-cs-border/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="CloakStamp" className="h-5" />
              <span className="font-inter font-bold text-white">CloakStamp</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm font-manrope leading-relaxed">
              Privacy-first document certification & verification on Aleo.
              Zero-knowledge proofs ensure your documents stay private while remaining verifiable.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Protocol
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/certify', label: 'Certify Document' },
                { to: '/documents', label: 'My Documents' },
                { to: '/prove', label: 'Prove Ownership' },
                { to: '/verify', label: 'Verify Proof' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/issuers', label: 'Issuers' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-white font-manrope transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { href: 'https://aleo.org', label: 'Aleo Network' },
                { href: 'https://testnet.explorer.provable.com', label: 'Block Explorer' },
                { href: 'https://developer.aleo.org', label: 'Developer Docs' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-white font-manrope transition-colors"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cs-border/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-manrope">
            © {new Date().getFullYear()} CloakStamp. Built on Aleo with zero-knowledge proofs.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Testnet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
