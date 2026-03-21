import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 text-black px-4 py-6">
        {/* Conteúdo principal aqui */}
      </main>
      <Footer />
    </div>
  );
}
