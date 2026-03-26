import { memo } from "react";

const Footer = memo(function Footer() {
  return (
    <footer className="w-full h-12 bg-gray-300 flex items-center justify-center text-sm text-black">
      © 2026 Portal de Denúncias. Todos os direitos reservados.
    </footer>
  );
});

export default Footer;
