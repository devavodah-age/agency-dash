export default function Privacy() {
  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#fff", fontFamily: "Arial, sans-serif", padding: "60px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ color: "#888", marginBottom: 40 }}>Última atualização: 26 de julho de 2026</p>

        <h2 style={{ color: "#a78bfa" }}>1. Dados coletados</h2>
        <p>Coletamos nome, e-mail e credenciais de acesso necessários para o funcionamento da plataforma. Dados de campanhas e integrações com Meta Ads são armazenados para fins de análise e relatórios.</p>

        <h2 style={{ color: "#a78bfa" }}>2. Uso dos dados</h2>
        <p>Os dados são usados exclusivamente para fornecer os serviços da Agência Avodah: gestão de clientes, integração com Meta Ads e geração de relatórios de performance.</p>

        <h2 style={{ color: "#a78bfa" }}>3. Compartilhamento</h2>
        <p>Não compartilhamos seus dados com terceiros, exceto quando necessário para o funcionamento das integrações (Meta Business API).</p>

        <h2 style={{ color: "#a78bfa" }}>4. Segurança</h2>
        <p>Utilizamos criptografia e boas práticas de segurança para proteger seus dados. Senhas são armazenadas com hash bcrypt.</p>

        <h2 style={{ color: "#a78bfa" }}>5. Seus direitos</h2>
        <p>Você pode solicitar a exclusão dos seus dados a qualquer momento através da página de exclusão de dados ou pelo e-mail de contato da agência.</p>

        <h2 style={{ color: "#a78bfa" }}>6. Contato</h2>
        <p>Dúvidas? Entre em contato com a Agência Avodah.</p>
      </div>
    </div>
  )
}
