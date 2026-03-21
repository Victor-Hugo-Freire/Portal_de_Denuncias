import Header from "../../components/header";
import Footer from "../../components/footer";

export default function AcompanharPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showMakeComplaintButton={true}
        showCodeButton={true}
        isLoggedIn={false}
      />
      <main className="flex-1 bg-white text-black px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Acompanhar Denúncias</h1>
          <p>Página para acompanhar denúncias.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
