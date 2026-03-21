import Header from "../../components/header";
import Footer from "../../components/footer";

export default function DenunciaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showMakeComplaintButton={false}
        showCodeButton={true}
        isLoggedIn={false}
      />
      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Fazer Denúncia</h1>
          {/* Formulário aqui */}
          <p>Formulário de denúncia em desenvolvimento.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
